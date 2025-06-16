package com.suza.connect.dto;

import java.util.List;

public class AnnouncementDTO {
    private String title;
    private String content;
    private String status; // 'new', 'important', 'update'
    private List<String> attachments; // List of attachment file names or URLs

    // Getters and Setters
    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public List<String> getAttachments() {
        return attachments;
    }

    public void setAttachments(List<String> attachments) {
        this.attachments = attachments;
    }
}