import { useState, useMemo } from "react";
import {
    Modal,
    Input,
    Checkbox,
    Button,
    Tooltip,
    Space,
    Divider,
} from "antd";
import { EditOutlined } from "@ant-design/icons";
import CreateLabelModal from "./LabelModal";

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

export default function LabelPicker({
    open,
    onClose,
    labels,
    selectedIds,
    onChange,
}: Props) {
    const [search, setSearch] = useState("");
    const [createOpen, setCreateOpen] = useState(false);

    const filtered = useMemo(() => {
        return labels.filter((l) =>
            l.name.toLowerCase().includes(search.toLowerCase())
        );
    }, [labels, search]);

    const toggleSelect = (id: string) => {
        const isSelected = selectedIds.includes(id);
        if (isSelected) onChange(selectedIds.filter((x) => x !== id));
        else onChange([...selectedIds, id]);
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
            <Input
                placeholder="Tìm nhãn..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                    marginBottom: 8,
                    background: "#ffffff",
                    color: "#8c8c8c",
                    borderColor: "#999999",
                }}
            />

            <div
                style={{
                    maxHeight: 220,
                    overflowY: "auto",
                    marginBottom: 8,
                }}
            >
                {filtered.map((label) => (
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
                                checked={selectedIds.includes(label.id)}
                                onChange={() => toggleSelect(label.id)}
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
                                        selectedIds.includes(label.id)
                                            ? "0 0 4px rgba(255,255,255,0.6)"
                                            : "none",
                                    transition: "all 0.2s ease",
                                }}
                            >
                                {label.name}
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

            <Divider style={{ margin: "8px 0", borderColor: "#333" }} />

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
                    console.log("Nhãn mới:", newLabel);
                    setCreateOpen(false);
                }}
            />

           
        </Modal>
    );
}
