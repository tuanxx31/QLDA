import { useState, useMemo } from "react";
import {
    Modal,
    Input,
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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";

interface Label {
    id: string;
    name: string;
    color: string;
}

interface Props {
    open: boolean;
    onClose: () => void;
    labels: Label[];
    selectedIds: string[];
    onChange: (ids: string[]) => void;
    onCreateNew?: () => void;
}
const COLORS = [
    "#216e4e", "#7f5f01", "#9e4c00", "#ae2e24", "#803fa5"

];
export default function LabelPicker({
    open,
    onClose,
    labels,
    selectedIds,
    onChange,
}: Props) {
    const [search, setSearch] = useState("");
    const [createOpen, setCreateOpen] = useState(false);
    const queryClient = useQueryClient();
    const { projectId } = useParams<{ projectId: string }>();


    const toggleSelect = (id: string) => {
        const isSelected = selectedIds.includes(id);
        if (isSelected) onChange(selectedIds.filter((x) => x !== id));
        else onChange([...selectedIds, id]);
    };

    const createLabelMutation = useMutation({
        mutationFn: ({ name, color, projectId }: { name?: string, color: string, projectId: string }) => labelService.createLabel(name, color, projectId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["labels"] });
            message.success("Tạo nhãn thành công 123");
        },
        onError: () => {
            message.error("Không thể tạo nhãn");
        },
    });

    const handleCreateLabel = (color: string) => {
        console.log({color});
        createLabelMutation.mutate({
            name: "",
            color: color,
            projectId: projectId as string,
        });
    };
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
                {COLORS.map((color) => (
                    <div
                        key={color}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "6px 0",
                        }}
                    >
                        <Space>
                            <Checkbox
                                checked={selectedIds.includes(color)}
                                onChange={() => toggleSelect(color)}
                                style={{ marginTop: -2 }}
                                onClick={() => handleCreateLabel(color)}
                            />
                            <div
                                style={{
                                    backgroundColor: color,
                                    color: "#fff",
                                    fontWeight: 500,
                                    padding: "6px 10px",
                                    minWidth: 215,
                                    textAlign: "center",
                                    borderRadius: 6,
                                    boxShadow:
                                        selectedIds.includes(color)
                                            ? "0 0 4px rgba(255,255,255,0.6)"
                                            : "none",
                                    transition: "all 0.2s ease",
                                    minHeight: 25,
                                }}
                            >
                                {/* {color.slice(1)} */}
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
                ))}
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
                }}
            />
        </Modal>
    );
}
