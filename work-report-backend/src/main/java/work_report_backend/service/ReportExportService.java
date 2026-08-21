package work_report_backend.service;

import com.lowagie.text.Element;
import com.lowagie.text.FontFactory;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.apache.poi.ss.usermodel.BorderStyle;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.HorizontalAlignment;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.VerticalAlignment;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.apache.poi.xwpf.usermodel.ParagraphAlignment;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFParagraph;
import org.apache.poi.xwpf.usermodel.XWPFRun;
import org.apache.poi.xwpf.usermodel.XWPFTable;
import org.apache.poi.xwpf.usermodel.XWPFTableCell;
import org.apache.poi.xwpf.usermodel.XWPFTableRow;
import org.springframework.stereotype.Service;
import work_report_backend.dto.ReportPreviewResponse;
import work_report_backend.dto.WorkEntryResponse;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class ReportExportService {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    // ─────────────────────────────────────────────────────────────────────────
    // 1. PDF EXPORT
    // ─────────────────────────────────────────────────────────────────────────
    public byte[] generatePdf(ReportPreviewResponse report) {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            // A4 Landscape for comfortable 7-column layout
            com.lowagie.text.Document document = new com.lowagie.text.Document(PageSize.A4.rotate(), 28, 28, 28, 28);
            PdfWriter.getInstance(document, out);

            document.open();

            // Colors
            Color primaryColor = new Color(37, 99, 235);     // Blue-600
            Color headerBgColor = new Color(30, 41, 59);    // Slate-800
            Color textMuted = new Color(100, 116, 139);      // Slate-500
            Color altRowColor = new Color(248, 250, 252);   // Slate-50
            Color borderColor = new Color(226, 232, 240);   // Slate-200

            // Fonts
            com.lowagie.text.Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, primaryColor);
            com.lowagie.text.Font metaLabelFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, headerBgColor);
            com.lowagie.text.Font metaValueFont = FontFactory.getFont(FontFactory.HELVETICA, 9, headerBgColor);
            com.lowagie.text.Font thFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8, Color.WHITE);
            com.lowagie.text.Font tdFont = FontFactory.getFont(FontFactory.HELVETICA, 8, headerBgColor);

            // Document Header
            Paragraph title = new Paragraph("WORK REPORT", titleFont);
            title.setSpacingAfter(4f);
            document.add(title);

            // Metadata / Summary Table
            PdfPTable metaTable = new PdfPTable(4);
            metaTable.setWidthPercentage(100);
            metaTable.setSpacingAfter(12f);
            metaTable.setWidths(new float[]{1.5f, 3.5f, 1.5f, 3.5f});

            addMetaCell(metaTable, "User:", metaLabelFont, report.getUserName() + " (" + report.getUserEmail() + ")", metaValueFont);

            String periodStr = (report.getStartDate() != null ? report.getStartDate().format(DATE_FORMATTER) : "Any")
                    + "  to  " + (report.getEndDate() != null ? report.getEndDate().format(DATE_FORMATTER) : "Any");
            addMetaCell(metaTable, "Period:", metaLabelFont, periodStr, metaValueFont);

            addMetaCell(metaTable, "Total Entries:", metaLabelFont, String.valueOf(report.getTotalEntries()), metaValueFont);
            addMetaCell(metaTable, "Total Projects:", metaLabelFont, String.valueOf(report.getTotalProjects()), metaValueFont);

            document.add(metaTable);

            // Data Table
            List<WorkEntryResponse> entries = report.getEntries();
            if (entries == null || entries.isEmpty()) {
                Paragraph empty = new Paragraph("No work entries found for the selected filters.",
                        FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 10, textMuted));
                empty.setAlignment(Element.ALIGN_CENTER);
                empty.setSpacingBefore(20f);
                document.add(empty);
            } else {
                PdfPTable table = new PdfPTable(7);
                table.setWidthPercentage(100);
                table.setHeaderRows(1);
                table.setWidths(new float[]{10f, 13f, 18f, 27f, 11f, 11f, 10f});

                String[] headers = {"Date", "Project", "Title", "Description", "Category", "Technology", "Status"};
                for (String h : headers) {
                    PdfPCell cell = new PdfPCell(new Phrase(h, thFont));
                    cell.setBackgroundColor(headerBgColor);
                    cell.setPadding(6f);
                    cell.setHorizontalAlignment(Element.ALIGN_LEFT);
                    cell.setBorderColor(headerBgColor);
                    table.addCell(cell);
                }

                boolean alternate = false;
                for (WorkEntryResponse entry : entries) {
                    Color rowBg = alternate ? altRowColor : Color.WHITE;

                    addTableCell(table, entry.getDate() != null ? entry.getDate().toString() : "—", tdFont, rowBg, borderColor);
                    addTableCell(table, entry.getProjectName() != null ? entry.getProjectName() : "—", tdFont, rowBg, borderColor);
                    addTableCell(table, entry.getTitle() != null ? entry.getTitle() : "—", tdFont, rowBg, borderColor);
                    addTableCell(table, entry.getDescription() != null ? entry.getDescription() : "—", tdFont, rowBg, borderColor);
                    addTableCell(table, entry.getCategory() != null ? entry.getCategory() : "—", tdFont, rowBg, borderColor);
                    addTableCell(table, entry.getTechnology() != null ? entry.getTechnology() : "—", tdFont, rowBg, borderColor);
                    addTableCell(table, entry.getStatus() != null ? entry.getStatus() : "—", tdFont, rowBg, borderColor);

                    alternate = !alternate;
                }

                document.add(table);
            }

            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate PDF report: " + e.getMessage(), e);
        }
    }

    private void addMetaCell(PdfPTable table, String label, com.lowagie.text.Font labelFont, String value, com.lowagie.text.Font valueFont) {
        PdfPCell labelCell = new PdfPCell(new Phrase(label, labelFont));
        labelCell.setBorder(com.lowagie.text.Rectangle.NO_BORDER);
        labelCell.setPadding(2f);
        table.addCell(labelCell);

        PdfPCell valueCell = new PdfPCell(new Phrase(value, valueFont));
        valueCell.setBorder(com.lowagie.text.Rectangle.NO_BORDER);
        valueCell.setPadding(2f);
        table.addCell(valueCell);
    }

    private void addTableCell(PdfPTable table, String text, com.lowagie.text.Font font, Color bgColor, Color borderColor) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setBackgroundColor(bgColor);
        cell.setBorderColor(borderColor);
        cell.setPadding(5f);
        cell.setVerticalAlignment(Element.ALIGN_TOP);
        table.addCell(cell);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 2. WORD (.DOCX) EXPORT
    // ─────────────────────────────────────────────────────────────────────────
    public byte[] generateDocx(ReportPreviewResponse report) {
        try (XWPFDocument doc = new XWPFDocument();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            // Title
            XWPFParagraph titlePara = doc.createParagraph();
            titlePara.setSpacingAfter(100);
            XWPFRun titleRun = titlePara.createRun();
            titleRun.setText("WORK REPORT");
            titleRun.setBold(true);
            titleRun.setFontSize(18);
            titleRun.setColor("2563EB");
            titleRun.setFontFamily("Arial");

            // Metadata Paragraph
            XWPFParagraph metaPara = doc.createParagraph();
            metaPara.setSpacingAfter(200);

            String periodStr = (report.getStartDate() != null ? report.getStartDate().format(DATE_FORMATTER) : "Any")
                    + " to " + (report.getEndDate() != null ? report.getEndDate().format(DATE_FORMATTER) : "Any");

            addMetaLine(metaPara, "User: ", report.getUserName() + " (" + report.getUserEmail() + ")");
            addMetaLine(metaPara, "Period: ", periodStr);
            addMetaLine(metaPara, "Total Entries: ", String.valueOf(report.getTotalEntries()));
            addMetaLine(metaPara, "Total Projects: ", String.valueOf(report.getTotalProjects()));

            List<WorkEntryResponse> entries = report.getEntries();
            if (entries == null || entries.isEmpty()) {
                XWPFParagraph emptyPara = doc.createParagraph();
                XWPFRun emptyRun = emptyPara.createRun();
                emptyRun.setText("No work entries found for the selected filters.");
                emptyRun.setItalic(true);
                emptyRun.setColor("64748B");
                emptyRun.setFontFamily("Arial");
            } else {
                // Table
                XWPFTable table = doc.createTable();
                table.setWidth("100%");

                // Header Row
                XWPFTableRow headerRow = table.getRow(0);
                String[] headers = {"Date", "Project", "Title", "Description", "Category", "Technology", "Status"};
                for (int i = 0; i < headers.length; i++) {
                    XWPFTableCell cell = (i == 0) ? headerRow.getCell(0) : headerRow.createCell();
                    cell.setColor("1E293B"); // Slate-800
                    XWPFParagraph p = cell.getParagraphs().get(0);
                    p.setAlignment(ParagraphAlignment.LEFT);
                    XWPFRun r = p.createRun();
                    r.setText(headers[i]);
                    r.setBold(true);
                    r.setColor("FFFFFF");
                    r.setFontSize(9);
                    r.setFontFamily("Arial");
                }

                // Data Rows
                for (WorkEntryResponse entry : entries) {
                    XWPFTableRow row = table.createRow();
                    setDocxCell(row.getCell(0), entry.getDate() != null ? entry.getDate().toString() : "—");
                    setDocxCell(row.getCell(1), entry.getProjectName() != null ? entry.getProjectName() : "—");
                    setDocxCell(row.getCell(2), entry.getTitle() != null ? entry.getTitle() : "—");
                    setDocxCell(row.getCell(3), entry.getDescription() != null ? entry.getDescription() : "—");
                    setDocxCell(row.getCell(4), entry.getCategory() != null ? entry.getCategory() : "—");
                    setDocxCell(row.getCell(5), entry.getTechnology() != null ? entry.getTechnology() : "—");
                    setDocxCell(row.getCell(6), entry.getStatus() != null ? entry.getStatus() : "—");
                }
            }

            doc.write(out);
            return out.toByteArray();
        } catch (IOException e) {
            throw new RuntimeException("Failed to generate Word document: " + e.getMessage(), e);
        }
    }

    private void addMetaLine(XWPFParagraph para, String label, String value) {
        XWPFRun lRun = para.createRun();
        lRun.setText(label);
        lRun.setBold(true);
        lRun.setFontSize(10);
        lRun.setFontFamily("Arial");

        XWPFRun vRun = para.createRun();
        vRun.setText(value + "    ");
        vRun.setFontSize(10);
        vRun.setFontFamily("Arial");
    }

    private void setDocxCell(XWPFTableCell cell, String text) {
        XWPFParagraph p = cell.getParagraphs().get(0);
        p.setSpacingBefore(40);
        p.setSpacingAfter(40);
        XWPFRun r = p.createRun();
        r.setText(text);
        r.setFontSize(8.5);
        r.setFontFamily("Arial");
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 3. EXCEL (.XLSX) EXPORT
    // ─────────────────────────────────────────────────────────────────────────
    public byte[] generateExcel(ReportPreviewResponse report) {
        try (Workbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet("Work Report");
            sheet.setDisplayGridlines(true);

            // Styles & Fonts
            org.apache.poi.ss.usermodel.Font titleFont = workbook.createFont();
            titleFont.setFontName("Arial");
            titleFont.setBold(true);
            titleFont.setFontHeightInPoints((short) 16);
            titleFont.setColor(IndexedColors.ROYAL_BLUE.getIndex());

            CellStyle titleStyle = workbook.createCellStyle();
            titleStyle.setFont(titleFont);

            org.apache.poi.ss.usermodel.Font metaLabelFont = workbook.createFont();
            metaLabelFont.setFontName("Arial");
            metaLabelFont.setBold(true);
            metaLabelFont.setFontHeightInPoints((short) 10);

            CellStyle metaLabelStyle = workbook.createCellStyle();
            metaLabelStyle.setFont(metaLabelFont);

            org.apache.poi.ss.usermodel.Font metaValueFont = workbook.createFont();
            metaValueFont.setFontName("Arial");
            metaValueFont.setFontHeightInPoints((short) 10);

            CellStyle metaValueStyle = workbook.createCellStyle();
            metaValueStyle.setFont(metaValueFont);

            org.apache.poi.ss.usermodel.Font headerFont = workbook.createFont();
            headerFont.setFontName("Arial");
            headerFont.setBold(true);
            headerFont.setColor(IndexedColors.WHITE.getIndex());
            headerFont.setFontHeightInPoints((short) 10);

            CellStyle headerStyle = workbook.createCellStyle();
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerStyle.setAlignment(HorizontalAlignment.LEFT);
            headerStyle.setVerticalAlignment(VerticalAlignment.CENTER);
            setThinBorders(headerStyle);

            org.apache.poi.ss.usermodel.Font dataFont = workbook.createFont();
            dataFont.setFontName("Arial");
            dataFont.setFontHeightInPoints((short) 9);

            CellStyle dataStyle = workbook.createCellStyle();
            dataStyle.setFont(dataFont);
            dataStyle.setVerticalAlignment(VerticalAlignment.TOP);
            setThinBorders(dataStyle);

            CellStyle wrapDataStyle = workbook.createCellStyle();
            wrapDataStyle.setFont(dataFont);
            wrapDataStyle.setVerticalAlignment(VerticalAlignment.TOP);
            wrapDataStyle.setWrapText(true);
            setThinBorders(wrapDataStyle);

            // Title Row
            org.apache.poi.ss.usermodel.Row titleRow = sheet.createRow(0);
            org.apache.poi.ss.usermodel.Cell titleCell = titleRow.createCell(0);
            titleCell.setCellValue("WORK REPORT");
            titleCell.setCellStyle(titleStyle);

            // Metadata Rows
            org.apache.poi.ss.usermodel.Row userRow = sheet.createRow(1);
            org.apache.poi.ss.usermodel.Cell uLabel = userRow.createCell(0);
            uLabel.setCellValue("User:");
            uLabel.setCellStyle(metaLabelStyle);
            org.apache.poi.ss.usermodel.Cell uVal = userRow.createCell(1);
            uVal.setCellValue(report.getUserName() + " (" + report.getUserEmail() + ")");
            uVal.setCellStyle(metaValueStyle);

            String periodStr = (report.getStartDate() != null ? report.getStartDate().format(DATE_FORMATTER) : "Any")
                    + " to " + (report.getEndDate() != null ? report.getEndDate().format(DATE_FORMATTER) : "Any");

            org.apache.poi.ss.usermodel.Row periodRow = sheet.createRow(2);
            org.apache.poi.ss.usermodel.Cell pLabel = periodRow.createCell(0);
            pLabel.setCellValue("Period:");
            pLabel.setCellStyle(metaLabelStyle);
            org.apache.poi.ss.usermodel.Cell pVal = periodRow.createCell(1);
            pVal.setCellValue(periodStr);
            pVal.setCellStyle(metaValueStyle);

            org.apache.poi.ss.usermodel.Row summaryRow = sheet.createRow(3);
            org.apache.poi.ss.usermodel.Cell s1Label = summaryRow.createCell(0);
            s1Label.setCellValue("Total Entries:");
            s1Label.setCellStyle(metaLabelStyle);
            org.apache.poi.ss.usermodel.Cell s1Val = summaryRow.createCell(1);
            s1Val.setCellValue(report.getTotalEntries());
            s1Val.setCellStyle(metaValueStyle);

            org.apache.poi.ss.usermodel.Cell s2Label = summaryRow.createCell(2);
            s2Label.setCellValue("Total Projects:");
            s2Label.setCellStyle(metaLabelStyle);
            org.apache.poi.ss.usermodel.Cell s2Val = summaryRow.createCell(3);
            s2Val.setCellValue(report.getTotalProjects());
            s2Val.setCellStyle(metaValueStyle);

            // Table Headers Row
            int startRow = 5;
            org.apache.poi.ss.usermodel.Row headerRow = sheet.createRow(startRow);
            headerRow.setHeightInPoints(24);
            String[] headers = {"Date", "Project", "Title", "Description", "Category", "Technology", "Status"};
            for (int i = 0; i < headers.length; i++) {
                org.apache.poi.ss.usermodel.Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            // Data Rows
            int currentRow = startRow + 1;
            List<WorkEntryResponse> entries = report.getEntries();
            if (entries != null && !entries.isEmpty()) {
                for (WorkEntryResponse entry : entries) {
                    org.apache.poi.ss.usermodel.Row row = sheet.createRow(currentRow++);
                    createPoiCell(row, 0, entry.getDate() != null ? entry.getDate().toString() : "", dataStyle);
                    createPoiCell(row, 1, entry.getProjectName() != null ? entry.getProjectName() : "", dataStyle);
                    createPoiCell(row, 2, entry.getTitle() != null ? entry.getTitle() : "", dataStyle);
                    createPoiCell(row, 3, entry.getDescription() != null ? entry.getDescription() : "", wrapDataStyle);
                    createPoiCell(row, 4, entry.getCategory() != null ? entry.getCategory() : "", dataStyle);
                    createPoiCell(row, 5, entry.getTechnology() != null ? entry.getTechnology() : "", dataStyle);
                    createPoiCell(row, 6, entry.getStatus() != null ? entry.getStatus() : "", dataStyle);
                }
            } else {
                org.apache.poi.ss.usermodel.Row emptyRow = sheet.createRow(currentRow);
                org.apache.poi.ss.usermodel.Cell emptyCell = emptyRow.createCell(0);
                emptyCell.setCellValue("No work entries found for the selected filters.");
                CellStyle italicStyle = workbook.createCellStyle();
                org.apache.poi.ss.usermodel.Font italicFont = workbook.createFont();
                italicFont.setItalic(true);
                italicFont.setColor(IndexedColors.GREY_50_PERCENT.getIndex());
                italicStyle.setFont(italicFont);
                emptyCell.setCellStyle(italicStyle);
            }

            // Column Widths
            sheet.setColumnWidth(0, 14 * 256); // Date
            sheet.setColumnWidth(1, 20 * 256); // Project
            sheet.setColumnWidth(2, 28 * 256); // Title
            sheet.setColumnWidth(3, 40 * 256); // Description
            sheet.setColumnWidth(4, 16 * 256); // Category
            sheet.setColumnWidth(5, 16 * 256); // Technology
            sheet.setColumnWidth(6, 14 * 256); // Status

            workbook.write(out);
            return out.toByteArray();
        } catch (IOException e) {
            throw new RuntimeException("Failed to generate Excel workbook: " + e.getMessage(), e);
        }
    }

    private void createPoiCell(org.apache.poi.ss.usermodel.Row row, int column, String value, CellStyle style) {
        org.apache.poi.ss.usermodel.Cell cell = row.createCell(column);
        cell.setCellValue(value != null ? value : "");
        cell.setCellStyle(style);
    }

    private void setThinBorders(CellStyle style) {
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
    }
}
