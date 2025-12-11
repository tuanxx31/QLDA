package com.qlda.backendjava.columns.dto;

import com.qlda.backendjava.projects.dto.ProjectResponseDto;
import com.qlda.backendjava.tasks.dto.TaskResponseDto;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ColumnResponseDto {
    private String id;
    private String name;
    private Integer order;
    
    
    private ProjectResponseDto project; 
    private List<TaskResponseDto> tasks; 
}

