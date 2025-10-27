import { message, Tabs } from "antd";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { projectMemberService } from "@/services/project.services";
import { ProjectMembersTable } from "./ProjectMembersTable ";
interface Props {
  projectId: string;
}

const ProjectMembers = ({ projectId}: Props) => {
  const qc = useQueryClient();

  const { data: projectMembers, isLoading } = useQuery({
    queryKey: ["projectMembers", projectId],
    queryFn: async () => await projectMemberService.getProjectMebers(projectId),
  });

  const removeMutation = useMutation({
    mutationFn: (userId: string) => projectMemberService.remove(projectId, userId),
    onSuccess: () => {
      message.success("Đã xóa thành viên");
      qc.invalidateQueries({ queryKey: ["projectMembers", projectId] });
    },
  });

  return (
   
    <Tabs
    defaultActiveKey="members"
    style={{ marginTop: 24 }}
    items={[
      {
        key: "members",
        label: "Thành viên",
        children: (
          <ProjectMembersTable
            projectMembers={projectMembers}
            projectId={projectId}
            isLeader={false}
            onUpdate={() =>
              qc.invalidateQueries({ queryKey: ["projectMembers", projectId] })
            }
          />
        ),
      },
    ]}
  />
  );
};

export default ProjectMembers;
