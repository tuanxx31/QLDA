package com.qlda.backendjava.groupmember.controller;

import com.qlda.backendjava.groupmember.service.GroupMemberService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Tag(name = "Group Members", description = "API quản lý thành viên nhóm")
@RestController
@RequestMapping("/api/group-members")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
public class GroupMemberController {

    private final GroupMemberService groupMemberService;

    @GetMapping("/{groupId}")
    @Operation(summary = "Lấy danh sách thành viên của nhóm")
    public ResponseEntity<List<Map<String, Object>>> findAll(@PathVariable String groupId) {
        List<Map<String, Object>> members = groupMemberService.findAllByGroup(groupId);
        return ResponseEntity.ok(members);
    }
}

