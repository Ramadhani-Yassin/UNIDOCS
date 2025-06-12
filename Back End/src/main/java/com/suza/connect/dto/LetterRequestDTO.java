package com.suza.connect.dto;

import java.util.Date;

public class LetterRequestDTO {
    private String id; // Add this line
    private String fullName;
    private String email;
    private String registrationNumber;
    private String phoneNumber;
    private String programOfStudy;
    private Integer yearOfStudy;
    private String letterType;
    private String reasonForRequest;
    private Date effectiveDate;
    private String organizationName;
    private Date startDate;
    private Date endDate;
    private String researchTitle;
    private String recommendationPurpose;
    private String receivingInstitution;
    private Date submissionDeadline;
    private String transcriptPurpose;
    private String deliveryMethod;
    private String status; // Add this field
    private java.time.LocalDateTime requestDate;
    private String adminComment;

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getRegistrationNumber() {
        return registrationNumber;
    }

    public void setRegistrationNumber(String registrationNumber) {
        this.registrationNumber = registrationNumber;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getProgramOfStudy() {
        return programOfStudy;
    }

    public void setProgramOfStudy(String programOfStudy) {
        this.programOfStudy = programOfStudy;
    }

    public Integer getYearOfStudy() {
        return yearOfStudy;
    }

    public void setYearOfStudy(Integer yearOfStudy) {
        this.yearOfStudy = yearOfStudy;
    }

    public String getLetterType() {
        return letterType;
    }

    public void setLetterType(String letterType) {
        this.letterType = letterType;
    }

    public String getReasonForRequest() {
        return reasonForRequest;
    }

    public void setReasonForRequest(String reasonForRequest) {
        this.reasonForRequest = reasonForRequest;
    }

    public Date getEffectiveDate() {
        return effectiveDate;
    }

    public void setEffectiveDate(Date effectiveDate) {
        this.effectiveDate = effectiveDate;
    }

    public String getOrganizationName() {
        return organizationName;
    }

    public void setOrganizationName(String organizationName) {
        this.organizationName = organizationName;
    }

    public Date getStartDate() {
        return startDate;
    }

    public void setStartDate(Date startDate) {
        this.startDate = startDate;
    }

    public Date getEndDate() {
        return endDate;
    }

    public void setEndDate(Date endDate) {
        this.endDate = endDate;
    }

    public String getResearchTitle() {
        return researchTitle;
    }

    public void setResearchTitle(String researchTitle) {
        this.researchTitle = researchTitle;
    }

    public String getRecommendationPurpose() {
        return recommendationPurpose;
    }

    public void setRecommendationPurpose(String recommendationPurpose) {
        this.recommendationPurpose = recommendationPurpose;
    }

    public String getReceivingInstitution() {
        return receivingInstitution;
    }

    public void setReceivingInstitution(String receivingInstitution) {
        this.receivingInstitution = receivingInstitution;
    }

    public Date getSubmissionDeadline() {
        return submissionDeadline;
    }

    public void setSubmissionDeadline(Date submissionDeadline) {
        this.submissionDeadline = submissionDeadline;
    }

    public String getTranscriptPurpose() {
        return transcriptPurpose;
    }

    public void setTranscriptPurpose(String transcriptPurpose) {
        this.transcriptPurpose = transcriptPurpose;
    }

    public String getDeliveryMethod() {
        return deliveryMethod;
    }

    public void setDeliveryMethod(String deliveryMethod) {
        this.deliveryMethod = deliveryMethod;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public java.time.LocalDateTime getRequestDate() {
        return requestDate;
    }

    public void setRequestDate(java.time.LocalDateTime requestDate) {
        this.requestDate = requestDate;
    }

    public String getAdminComment() {
        return adminComment;
    }

    public void setAdminComment(String adminComment) {
        this.adminComment = adminComment;
    }
}