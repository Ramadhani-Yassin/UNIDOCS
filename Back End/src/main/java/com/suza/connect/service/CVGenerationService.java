package com.suza.connect.service;

import org.apache.poi.xwpf.usermodel.*;
import org.springframework.stereotype.Service;

import java.io.*;
import java.util.Map;

@Service
public class CVGenerationService {

    public File fillTemplate(String templatePath, Map<String, String> placeholders) throws Exception {
        File templateFile = new File(templatePath);
        if (!templateFile.exists()) {
            throw new FileNotFoundException("Template not found: " + templatePath);
        }

        try (FileInputStream fis = new FileInputStream(templateFile);
             XWPFDocument doc = new XWPFDocument(fis)) {

            replacePlaceholdersInDocument(doc, placeholders);

            // Save filled DOCX to temp file
            File filledDocx = File.createTempFile("filled_cv", ".docx");
            try (FileOutputStream fos = new FileOutputStream(filledDocx)) {
                doc.write(fos);
            }
            return filledDocx;
        }
    }

    public File convertDocxToPdf(File docxFile) throws Exception {
        File pdfFile = new File(docxFile.getAbsolutePath().replace(".docx", ".pdf"));
        ProcessBuilder pb = new ProcessBuilder(
            "libreoffice",
            "--headless",
            "--convert-to", "pdf",
            "--outdir", docxFile.getParent(),
            docxFile.getAbsolutePath()
        );
        pb.redirectErrorStream(true);
        Process process = pb.start();
        int exitCode = process.waitFor();
        if (exitCode != 0 || !pdfFile.exists()) {
            throw new IOException("Failed to convert DOCX to PDF using LibreOffice.");
        }
        return pdfFile;
    }

    public void replacePlaceholdersInDocument(XWPFDocument doc, Map<String, String> placeholders) {
        // Replace in paragraphs
        for (XWPFParagraph paragraph : doc.getParagraphs()) {
            replaceInParagraph(paragraph, placeholders);
        }
        // Replace in tables
        for (XWPFTable table : doc.getTables()) {
            for (XWPFTableRow row : table.getRows()) {
                for (XWPFTableCell cell : row.getTableCells()) {
                    for (XWPFParagraph paragraph : cell.getParagraphs()) {
                        replaceInParagraph(paragraph, placeholders);
                    }
                }
            }
        }
    }

    private void replaceInParagraph(XWPFParagraph paragraph, Map<String, String> placeholders) {
        for (XWPFRun run : paragraph.getRuns()) {
            String text = run.getText(0);
            if (text != null) {
                for (Map.Entry<String, String> entry : placeholders.entrySet()) {
                    text = text.replace("{{" + entry.getKey() + "}}", entry.getValue());
                    text = text.replace("${" + entry.getKey() + "}", entry.getValue());
                    text = text.replace("<<" + entry.getKey() + ">>", entry.getValue());
                }
                run.setText(text, 0);
            }
        }
    }
}