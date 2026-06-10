package com.intern.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConfirmChangeRequestDTO {
    private Long changeRequestId;
    private String role;
    private String comment;
    private Long counselorId;
}
