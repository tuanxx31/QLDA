import {
    Modal,
    Input,
    Button,
    Tooltip,
    Row,
    Col,
    theme,
    Card,
} from "antd";
import {
    ArrowLeftOutlined,
    CloseOutlined,
    BgColorsOutlined,
} from "@ant-design/icons";
import { useState } from "react";

interface Props {
    open: boolean;
    onClose: () => void;
    onBack: () => void;
    onCreate: (label: { name: string; color: string | null }) => void;
}

const COLORS = [
    "#216e4e", "#7f5f01", "#9e4c00", "#ae2e24", "#803fa5",
    "#164b35", "#533f04", "#693200", "#5d1f1a", "#48245d",
    "#7ee2b8", "#eed12b", "#cecfd2", "#fd9891", "#d8a0f7",
    "#1558bc", "#206a83", "#4c6b1f", "#943d73", "#63666b",
    "#123263", "#22C55E", "#37471f", "#50253f", "#4b4d51",
    "#8fb8f6", "#9dd9ee", "#b3df72", "#f797d2", "#a9abaf",

];

export default function CreateLabelModal({
    open,
    onClose,
    onBack,
    onCreate,
}: Props) {
    const [name, setName] = useState("");
    const [color, setColor] = useState<string | null>(null);
    const { token } = theme.useToken();

    const handleCreate = () => {
        if (!name.trim()) return;
        onCreate({ name: name.trim(), color });
        setName("");
        setColor(null);
        onClose();
    };

    return (
        <Modal
            open={open}
            onCancel={onClose}
            footer={null}
            width={400}
            title={
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                    }}
                >
                    <Button
                        icon={<ArrowLeftOutlined />}
                        type="text"
                        onClick={onBack}
                        style={{ marginLeft: -8 }}
                    />
                    <span style={{ fontWeight: 500 }}>Tạo nhãn mới</span>
                </div>
            }
        >
            <Card
                size="small"
                style={{
                    height: 50,
                    borderRadius: 10,
                    background: color || token.colorBgContainerDisabled,
                    marginBottom: 16,
                    boxShadow: token.boxShadowTertiary,
                }}
            />

            <div style={{ marginBottom: 16 }}>
                <label
                    style={{
                        display: "block",
                        color: token.colorTextSecondary,
                        marginBottom: 6,
                    }}
                >
                    Tiêu đề
                </label>
                <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nhập tên nhãn..."
                    prefix={<BgColorsOutlined style={{ color: token.colorPrimary }} />}
                />
            </div>

            <div style={{ marginBottom: 8 }}>
                <div
                    style={{
                        color: token.colorTextSecondary,
                        marginBottom: 9,
                        fontWeight: 500,
                    }}
                >
                    Chọn một màu
                </div>

                <Row gutter={[8, 8]}>
                    {COLORS.map((c) => (
                        <Col key={c} span={4}>
                            <Col key={c} span={4}>
                                <Tooltip title={c}>
                                    <div
                                        style={{
                                            width: 50,
                                            height: 32,
                                            borderRadius: 10,
                                            background: c,
                                            cursor: "pointer",
                                            border:
                                                color === c
                                                    ? `2px solid ${token.colorPrimary}`
                                                    : "1px solid rgba(0,0,0,0.2)",
                                            boxShadow:
                                                color === c
                                                    ? `0 0 8px ${token.colorPrimaryBorderHover}`
                                                    : undefined,
                                            transition: "all 0.15s ease",
                                        }}
                                        onMouseEnter={(e) =>
                                            (e.currentTarget.style.transform = "scale(1.08)")
                                        }
                                        onMouseLeave={(e) =>
                                            (e.currentTarget.style.transform = "scale(1)")
                                        }
                                        onClick={() => setColor(c)}
                                    />
                                </Tooltip>
                            </Col>

                        </Col>
                    ))}
                </Row>
            </div>

            <Button
                type="text"
                danger
                icon={<CloseOutlined />}
                style={{ marginTop: 8 }}
                onClick={() => setColor(null)}
            >
                Gỡ bỏ màu
            </Button>

            <div style={{ marginTop: 16 }}>
                <Button
                    type="primary"
                    block
                    onClick={handleCreate}
                    disabled={!name.trim()}
                >
                    Tạo mới
                </Button>
            </div>
        </Modal>
    );
}
