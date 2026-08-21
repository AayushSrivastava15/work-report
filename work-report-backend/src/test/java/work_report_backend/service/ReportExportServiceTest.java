package work_report_backend.service;

import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import work_report_backend.dto.ReportPreviewResponse;
import work_report_backend.dto.WorkEntryResponse;

import java.io.ByteArrayInputStream;
import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class ReportExportServiceTest {

    private ReportExportService exportService;

    @BeforeEach
    void setUp() {
        exportService = new ReportExportService();
    }

    private ReportPreviewResponse createSampleReport(boolean withEntries) {
        List<WorkEntryResponse> entries = withEntries ? List.of(
                new WorkEntryResponse(1L, LocalDate.of(2026, 8, 19), "Token API",
                        "Implemented authentication tokens", "Development", "Spring Boot", "Completed", 10L, "DPWS"),
                new WorkEntryResponse(2L, LocalDate.of(2026, 8, 18), "API Testing",
                        "Tested all endpoints", "Testing", "JUnit", "In Progress", 20L, "SNA-SPARSH")
        ) : List.of();

        return new ReportPreviewResponse(
                1L,
                "Aayush Srivastava",
                "aayush@example.com",
                LocalDate.of(2026, 8, 1),
                LocalDate.of(2026, 8, 31),
                entries.size(),
                withEntries ? 2 : 0,
                entries
        );
    }

    @Test
    void testGeneratePdfSuccess() {
        ReportPreviewResponse report = createSampleReport(true);
        byte[] pdfBytes = exportService.generatePdf(report);

        assertNotNull(pdfBytes);
        assertTrue(pdfBytes.length > 0);
        // PDF header magic bytes %PDF-
        String header = new String(pdfBytes, 0, Math.min(pdfBytes.length, 5));
        assertTrue(header.startsWith("%PDF"));
    }

    @Test
    void testGeneratePdfEmptyReport() {
        ReportPreviewResponse report = createSampleReport(false);
        byte[] pdfBytes = exportService.generatePdf(report);

        assertNotNull(pdfBytes);
        assertTrue(pdfBytes.length > 0);
    }

    @Test
    void testGenerateDocxSuccess() throws Exception {
        ReportPreviewResponse report = createSampleReport(true);
        byte[] docxBytes = exportService.generateDocx(report);

        assertNotNull(docxBytes);
        assertTrue(docxBytes.length > 0);

        // Verify valid docx by parsing it
        try (XWPFDocument doc = new XWPFDocument(new ByteArrayInputStream(docxBytes))) {
            assertNotNull(doc);
            assertFalse(doc.getTables().isEmpty());
            assertEquals(3, doc.getTables().get(0).getNumberOfRows()); // Header + 2 rows
        }
    }

    @Test
    void testGenerateDocxEmptyReport() throws Exception {
        ReportPreviewResponse report = createSampleReport(false);
        byte[] docxBytes = exportService.generateDocx(report);

        assertNotNull(docxBytes);
        assertTrue(docxBytes.length > 0);

        try (XWPFDocument doc = new XWPFDocument(new ByteArrayInputStream(docxBytes))) {
            assertNotNull(doc);
        }
    }

    @Test
    void testGenerateExcelSuccess() throws Exception {
        ReportPreviewResponse report = createSampleReport(true);
        byte[] xlsxBytes = exportService.generateExcel(report);

        assertNotNull(xlsxBytes);
        assertTrue(xlsxBytes.length > 0);

        // Verify valid Excel workbook by parsing it
        try (XSSFWorkbook workbook = new XSSFWorkbook(new ByteArrayInputStream(xlsxBytes))) {
            assertNotNull(workbook);
            assertEquals("Work Report", workbook.getSheetAt(0).getSheetName());
            assertEquals(7, workbook.getSheetAt(0).getPhysicalNumberOfRows());
        }
    }

    @Test
    void testGenerateExcelEmptyReport() throws Exception {
        ReportPreviewResponse report = createSampleReport(false);
        byte[] xlsxBytes = exportService.generateExcel(report);

        assertNotNull(xlsxBytes);
        assertTrue(xlsxBytes.length > 0);

        try (XSSFWorkbook workbook = new XSSFWorkbook(new ByteArrayInputStream(xlsxBytes))) {
            assertNotNull(workbook);
            assertEquals("Work Report", workbook.getSheetAt(0).getSheetName());
        }
    }
}
