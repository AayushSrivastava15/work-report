package work_report_backend.controller;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import work_report_backend.dto.ReportFilterRequest;
import work_report_backend.dto.ReportPreviewResponse;
import work_report_backend.repository.UserRepository;
import work_report_backend.service.ReportService;
import work_report_backend.util.SecurityUtils;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private static final String DOCX_MEDIA_TYPE = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    private static final String XLSX_MEDIA_TYPE = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

    private final ReportService reportService;
    private final UserRepository userRepository;

    public ReportController(ReportService reportService, UserRepository userRepository) {
        this.reportService = reportService;
        this.userRepository = userRepository;
    }

    // 1. Report Preview Data
    @GetMapping("/user/{userId}")
    public ResponseEntity<ReportPreviewResponse> getReportPreview(
            @PathVariable Long userId,
            @ModelAttribute ReportFilterRequest filter
    ) {
        SecurityUtils.validateUserAccess(userId, userRepository);
        ReportPreviewResponse response = reportService.generateReportData(userId, filter);
        return ResponseEntity.ok(response);
    }

    // 2. Export PDF
    @GetMapping("/user/{userId}/export/pdf")
    public ResponseEntity<byte[]> exportPdf(
            @PathVariable Long userId,
            @ModelAttribute ReportFilterRequest filter
    ) {
        SecurityUtils.validateUserAccess(userId, userRepository);
        byte[] pdfBytes = reportService.exportPdf(userId, filter);
        String filename = sanitizeFilename(reportService.generateFilename(filter, "pdf"));

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .body(pdfBytes);
    }

    // 3. Export Word (.docx)
    @GetMapping("/user/{userId}/export/docx")
    public ResponseEntity<byte[]> exportDocx(
            @PathVariable Long userId,
            @ModelAttribute ReportFilterRequest filter
    ) {
        SecurityUtils.validateUserAccess(userId, userRepository);
        byte[] docxBytes = reportService.exportDocx(userId, filter);
        String filename = sanitizeFilename(reportService.generateFilename(filter, "docx"));

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(DOCX_MEDIA_TYPE))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .body(docxBytes);
    }

    // 4. Export Excel (.xlsx)
    @GetMapping("/user/{userId}/export/excel")
    public ResponseEntity<byte[]> exportExcel(
            @PathVariable Long userId,
            @ModelAttribute ReportFilterRequest filter
    ) {
        SecurityUtils.validateUserAccess(userId, userRepository);
        byte[] xlsxBytes = reportService.exportExcel(userId, filter);
        String filename = sanitizeFilename(reportService.generateFilename(filter, "xlsx"));

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(XLSX_MEDIA_TYPE))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .body(xlsxBytes);
    }

    private String sanitizeFilename(String filename) {
        if (filename == null) return "work_report";
        return filename.replaceAll("[\\r\\n\\\"\\\\/]", "_");
    }
}
