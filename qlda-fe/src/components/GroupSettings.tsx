import { ProCard, ProList } from "@ant-design/pro-components";
import { Popconfirm, Button } from "antd";

export const GroupSettings = ({ onDelete }: { onDelete: () => void }) => (
  <ProCard bordered style={{ borderRadius: 12 }}>
    <ProList
      dataSource={[{ title: "Giải tán nhóm", danger: true }]}
      renderItem={(item) => (
        <Popconfirm
          title="Bạn có chắc chắn muốn giải tán nhóm không?"
          onConfirm={onDelete}
          okText="Xác nhận"
          cancelText="Hủy"
        >
          <Button type="primary" danger>
            {item.title}
          </Button>
        </Popconfirm>
      )}
    />
  </ProCard>
);
