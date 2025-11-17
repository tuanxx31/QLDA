import { useState, useEffect } from "react";
import {
    Modal,
    Checkbox,
    Button,
    Tooltip,
    Space,
    Divider,
    message,
} from "antd";
import { EditOutlined } from "@ant-design/icons";
import CreateLabelModal from "./LabelModal";
import { labelService } from "@/services/label.services";
import { taskService } from "@/services/task.services";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";

interface Label {
    id: string;
    name: string;
    color: string;
}

interface Props {
    open: boolean;
    onClose: () => void;
    taskId: string;
    selectedIds: string[];
    onTaskUpdate?: (task: any) => void;
    onCreateNew?: () => void;
}
export default function LabelPicker({
    open,
    onClose,
    taskId,
    selectedIds,
    onTaskUpdate,
}: Props) {
    const [createOpen, setCreateOpen] = useState(false);
    const [localSelectedIds, setLocalSelectedIds] = useState<string[]>(selectedIds);
    const queryClient = useQueryClient();
    const { projectId } = useParams<{ projectId: string }>();

    
    useEffect(() => {
        setLocalSelectedIds(selectedIds);
    }, [selectedIds]);

    
    const { data: projectLabels = [], isLoading: labelsLoading } = useQuery({
        queryKey: ["labels", projectId],
        queryFn: () => labelService.getLabelsByProject(projectId as string),
        enabled: !!projectId && open,
    });

    
    const assignLabelsMutation = useMutation({
        mutationFn: (labelIds: string[]) => taskService.assignLabels(taskId, labelIds),
        onSuccess: (updatedTask) => {
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
            queryClient.invalidateQueries({ queryKey: ["columns"] });
            
            if (updatedTask?.labels) {
                const newSelectedIds = updatedTask.labels.map((lb: any) => lb.id);
                setLocalSelectedIds(newSelectedIds);
            }
            
            if (updatedTask && onTaskUpdate) {
                onTaskUpdate(updatedTask);
            }
            message.success("Đã gán nhãn");
        },
        onError: () => {
            message.error("Không thể gán nhãn");
        },
    });

    
    const unassignLabelsMutation = useMutation({
        mutationFn: (labelIds: string[]) => taskService.unassignLabels(taskId, labelIds),
        onSuccess: (updatedTask) => {
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
            queryClient.invalidateQueries({ queryKey: ["columns"] });
            
            if (updatedTask?.labels) {
                const newSelectedIds = updatedTask.labels.map((lb: any) => lb.id);
                setLocalSelectedIds(newSelectedIds);
            }
            
            if (updatedTask && onTaskUpdate) {
                onTaskUpdate(updatedTask);
            }
            message.success("Đã bỏ gán nhãn");
        },
        onError: () => {
            message.error("Không thể bỏ gán nhãn");
        },
    });

    const toggleSelect = async (labelId: string) => {
        const isSelected = localSelectedIds.includes(labelId);
        if (isSelected) {
            
            await unassignLabelsMutation.mutateAsync([labelId]);
        } else {
            
            await assignLabelsMutation.mutateAsync([labelId]);
        }
    };

    const createLabelMutation = useMutation({
        mutationFn: ({ name, color, projectId }: { name?: string, color: string, projectId: string }) => labelService.createLabel(name, color, projectId),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["labels", projectId] });
            
            if (data?.id) {
                assignLabelsMutation.mutate([data.id]);
            } else if (data?.isExist && data?.id) {
                
                assignLabelsMutation.mutate([data.id]);
            }
            message.success("Tạo nhãn thành công");
        },
        onError: () => {
            message.error("Không thể tạo nhãn");
        },
    });
    return (
        <Modal
            open={open}
            onCancel={onClose}
            footer={null}
            width={340}
            title="Nhãn"
            bodyStyle={{
                paddingTop: 8,
                paddingBottom: 8,
                background: "#ffffff",
                color: "#8c8c8c",
            }}
        >


            <div
                style={{
                    maxHeight: 220,
                    overflowY: "auto",
                    marginBottom: 8,
                }}
            >
                {labelsLoading ? (
                    <div style={{ textAlign: "center", padding: 16 }}>Đang tải...</div>
                ) : projectLabels.length === 0 ? (
                    <div style={{ textAlign: "center", padding: 16, color: "#999" }}>
                        Chưa có nhãn nào
                    </div>
                ) : (
                    projectLabels.map((label: Label) => (
                        <div
                            key={label.id}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                padding: "6px 0",
                            }}
                        >
                            <Space>
                                <Checkbox
                                    checked={localSelectedIds.includes(label.id)}
                                    onChange={() => toggleSelect(label.id)}
                                    disabled={assignLabelsMutation.isPending || unassignLabelsMutation.isPending}
                                    style={{ marginTop: -2 }}
                                />
                                <div
                                    style={{
                                        backgroundColor: label.color,
                                        color: "#fff",
                                        fontWeight: 500,
                                        padding: "6px 10px",
                                        minWidth: 215,
                                        textAlign: "center",
                                        borderRadius: 6,
                                        boxShadow:
                                            localSelectedIds.includes(label.id)
                                                ? "0 0 4px rgba(255,255,255,0.6)"
                                                : "none",
                                        transition: "all 0.2s ease",
                                        minHeight: 25,
                                    }}
                                >
                                    {label.name || ""}
                                </div>
                            </Space>
                            <Tooltip title="Chỉnh sửa nhãn">
                                <EditOutlined
                                    style={{
                                        cursor: "pointer",
                                        color: "#aaa",
                                    }}
                                />
                            </Tooltip>
                        </div>
                    ))
                )}
            </div>

            <Divider style={{ margin: "20px 0", borderColor: "#333" }} />

            <Button
                block
                onClick={() => setCreateOpen(true)}
                style={{
                    background: "#2b6dee",
                    color: "#fff",

                }}
            >
                Tạo nhãn mới
            </Button>

            <CreateLabelModal
                open={createOpen}
                onClose={() => setCreateOpen(false)}
                onBack={() => setCreateOpen(false)}
                onCreate={(newLabel) => {
                    if (!newLabel.color) {
                        message.error("Vui lòng chọn màu cho nhãn");
                        return;
                    }
                    createLabelMutation.mutate(
                        {
                            name: newLabel.name || undefined,
                            color: newLabel.color,
                            projectId: projectId as string
                        }
                    );
                    setCreateOpen(false);
                }}
            />
        </Modal>
    );
}
