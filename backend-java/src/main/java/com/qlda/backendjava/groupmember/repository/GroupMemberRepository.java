package com.qlda.backendjava.groupmember.repository;

import com.qlda.backendjava.groupmember.entity.GroupMemberEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GroupMemberRepository extends JpaRepository<GroupMemberEntity, String> {
    Optional<GroupMemberEntity> findByGroupIdAndUserId(String groupId, String userId);
    
    @Query("SELECT gm FROM GroupMemberEntity gm WHERE gm.user.id = :userId AND gm.status = :status")
    List<GroupMemberEntity> findByUserIdAndStatus(@Param("userId") String userId, @Param("status") GroupMemberEntity.Status status);
    
    @Query("SELECT gm FROM GroupMemberEntity gm WHERE gm.group.id = :groupId AND gm.status = :status")
    List<GroupMemberEntity> findByGroupIdAndStatus(@Param("groupId") String groupId, @Param("status") GroupMemberEntity.Status status);
    
    @Query("SELECT gm FROM GroupMemberEntity gm WHERE gm.user.id = :userId")
    List<GroupMemberEntity> findByUserId(@Param("userId") String userId);
    
    boolean existsByGroupIdAndUserId(String groupId, String userId);
    
    @Query("SELECT gm FROM GroupMemberEntity gm " +
           "LEFT JOIN FETCH gm.user " +
           "WHERE gm.group.id = :groupId")
    List<GroupMemberEntity> findByGroupIdWithUser(@Param("groupId") String groupId);
}

