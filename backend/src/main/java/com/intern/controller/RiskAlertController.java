package com.intern.controller;

import com.intern.entity.RiskAlert;
import com.intern.service.RiskAlertService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/risks")
@RequiredArgsConstructor
public class RiskAlertController {

    private final RiskAlertService riskAlertService;

    @GetMapping
    public ResponseEntity<List<RiskAlert>> listRisks(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String level,
            @RequestParam(required = false) String status) {
        List<RiskAlert> risks = riskAlertService.findAll();
        if (type != null) {
            risks = risks.stream().filter(r -> type.equals(r.getType())).collect(Collectors.toList());
        }
        if (level != null) {
            risks = risks.stream().filter(r -> level.equals(r.getLevel())).collect(Collectors.toList());
        }
        if (status != null) {
            risks = risks.stream().filter(r -> status.equals(r.getStatus())).collect(Collectors.toList());
        }
        return ResponseEntity.ok(risks);
    }

    @GetMapping("/{id}")
    public ResponseEntity<RiskAlert> getRisk(@PathVariable Long id) {
        return riskAlertService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/resolve")
    public ResponseEntity<RiskAlert> resolve(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(riskAlertService.resolve(id, body.get("resolution")));
    }
}
