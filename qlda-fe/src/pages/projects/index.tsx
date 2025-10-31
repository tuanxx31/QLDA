import { useQuery } from "@tanstack/react-query";
import { projectService } from "@/services/project.services";
import { PageContainer } from "@ant-design/pro-components";
import { Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useState } from "react";
import ProjectFormModal from "./components/ProjectFormModal";
import ProjectTable from "./components/ProjectTable";

const ProjectPage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: projectService.getAllByUser,
  });

  const [openModal, setOpenModal] = useState(false);

  return (
    <PageContainer
      title="Dự án của tôi"
      extra={[
        <Button
          key="create"
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setOpenModal(true)}
        >
          Tạo dự án
        </Button>,
      ]}
    >
      <ProjectTable data={data} loading={isLoading} />
      <ProjectFormModal open={openModal} onClose={() => setOpenModal(false)} />
    </PageContainer>
  );
};

export default ProjectPage;
