package com.intern.controller;

import com.intern.dto.ConfirmChangeRequestDTO;
import com.intern.dto.CreateChangeRequestDTO;
import com.intern.entity.AgreementChangeRequest;
import com.intern.entity.AgreementVersion;
import com.intern.service.AgreementChangeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/agreement-changes")
@RequiredArgsConstructor
public class AgreementChangeController {

    private final AgreementChangeService agreementChangeService;

    @GetMapping
    public ResponseEntity<List<AgreementChangeRequest>> listChangeRequests(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long agreementId) {
        List<AgreementChangeRequest> requests;
        if (agreementId != null) {
            requests = agreementChangeService.findChangeRequestsByAgreementId(agreementId);
        } else if (status != null) {
            requests = agreementChangeService.findChangeRequestsByStatus(status);
        } else {
            requests = agreementChangeService.findAllChangeRequests();
        }
        requests.forEach(agreementChangeService::enrichChangeRequest);
        return ResponseEntity.ok(requests);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AgreementChangeRequest> getChangeRequest(@PathVariable Long id) {
        return agreementChangeService.findChangeRequestById(id)
                .map(r -> { agreementChangeService.enrichChangeRequest(r); return ResponseEntity.ok(r); })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createChangeRequest(@RequestBody CreateChangeRequestDTO dto) {
        try {
            AgreementChangeRequest request = agreementChangeService.createChangeRequest(dto);
            agreementChangeService.enrichChangeRequest(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(request);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}/confirm")
    public ResponseEntity<?> confirmChangeRequest(
            @PathVariable Long id,
            @RequestBody ConfirmChangeRequestDTO dto) {
        try {
            dto.setChangeRequestId(id);
            AgreementChangeRequest request = agreementChangeService.confirmChangeRequest(dto);
            agreementChangeService.enrichChangeRequest(request);
            return ResponseEntity.ok(request);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<?> rejectChangeRequest(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        try {
            String role = body.get("role");
            String rejectionReason = body.get("rejectionReason");
            AgreementChangeRequest request = agreementChangeService.rejectChangeRequest(id, role, rejectionReason);
            agreementChangeService.enrichChangeRequest(request);
            return ResponseEntity.ok(request);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/versions/{agreementId}")
    public ResponseEntity<List<AgreementVersion>> getAgreementVersions(@PathVariable Long agreementId) {
        List<AgreementVersion> versions = agreementChangeService.findVersionsByAgreementId(agreementId);
        return ResponseEntity.ok(versions);
    }
}
