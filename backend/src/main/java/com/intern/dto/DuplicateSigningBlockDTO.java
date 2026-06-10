package com.intern.dto;

import com.intern.entity.Agreement;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DuplicateSigningBlockDTO {
    private Boolean blocked;
    private String message;
    private String riskWarning;
    private String employmentOfficeRequirement;
    private Agreement existingAgreement;
    private String existingEnterpriseName;
    private String existingJobTitle;
    private String existingStudentName;
}
