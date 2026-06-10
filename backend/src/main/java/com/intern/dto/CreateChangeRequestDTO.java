package com.intern.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateChangeRequestDTO {
    private Long agreementId;
    private Long initiatedBy;
    private String changeReason;
    private String newLocation;
    private String newSalaryRange;
    private String newMentorName;
    private String newReportTime;
}
