package work_report_backend.controller;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import work_report_backend.dto.ReportFilterRequest;
import work_report_backend.dto.ReportPreviewResponse;
import work_report_backend.service.ReportService;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReportControllerTest {

    @Mock
    private ReportService reportService;

    @InjectMocks
    private ReportController reportController;

    @Test
    void testGetReportPreview() {
        ReportFilterRequest filter = new ReportFilterRequest();
        ReportPreviewResponse mockResponse = new ReportPreviewResponse(
                1L, "Aayush", "aayush@example.com", LocalDate.now(), LocalDate.now(), 0, 0, List.of()
        );

        when(reportService.generateReportData(eq(1L), any(ReportFilterRequest.class))).thenReturn(mockResponse);

        ResponseEntity<ReportPreviewResponse> response = reportController.getReportPreview(1L, filter);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("Aayush", response.getBody().getUserName());
    }

    @Test
    void testExportPdf() {
        ReportFilterRequest filter = new ReportFilterRequest();
        byte[] mockBytes = "%PDF-1.4 test".getBytes();

        when(reportService.exportPdf(eq(1L), any(ReportFilterRequest.class))).thenReturn(mockBytes);
        when(reportService.generateFilename(any(ReportFilterRequest.class), eq("pdf"))).thenReturn("work-report.pdf");

        ResponseEntity<byte[]> response = reportController.exportPdf(1L, filter);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("application/pdf", response.getHeaders().getContentType().toString());
        assertTrue(response.getHeaders().getFirst("Content-Disposition").contains("work-report.pdf"));
        assertArrayEquals(mockBytes, response.getBody());
    }

    @Test
    void testExportDocx() {
        ReportFilterRequest filter = new ReportFilterRequest();
        byte[] mockBytes = "docx-bytes".getBytes();

        when(reportService.exportDocx(eq(1L), any(ReportFilterRequest.class))).thenReturn(mockBytes);
        when(reportService.generateFilename(any(ReportFilterRequest.class), eq("docx"))).thenReturn("work-report.docx");

        ResponseEntity<byte[]> response = reportController.exportDocx(1L, filter);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getHeaders().getContentType().toString().contains("wordprocessingml"));
        assertTrue(response.getHeaders().getFirst("Content-Disposition").contains("work-report.docx"));
        assertArrayEquals(mockBytes, response.getBody());
    }

    @Test
    void testExportExcel() {
        ReportFilterRequest filter = new ReportFilterRequest();
        byte[] mockBytes = "excel-bytes".getBytes();

        when(reportService.exportExcel(eq(1L), any(ReportFilterRequest.class))).thenReturn(mockBytes);
        when(reportService.generateFilename(any(ReportFilterRequest.class), eq("xlsx"))).thenReturn("work-report.xlsx");

        ResponseEntity<byte[]> response = reportController.exportExcel(1L, filter);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getHeaders().getContentType().toString().contains("spreadsheetml"));
        assertTrue(response.getHeaders().getFirst("Content-Disposition").contains("work-report.xlsx"));
        assertArrayEquals(mockBytes, response.getBody());
    }
}
