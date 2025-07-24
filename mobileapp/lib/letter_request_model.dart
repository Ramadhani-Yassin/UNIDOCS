class LetterRequest {
  final String id;
  final String fullName;
  final String email;
  final String registrationNumber;
  final String phoneNumber;
  final String programOfStudy;
  final int yearOfStudy;
  final String letterType;
  final String reasonForRequest;
  final DateTime? effectiveDate;
  final String? organizationName;
  final DateTime? startDate;
  final DateTime? endDate;
  final String? researchTitle;
  final String? recommendationPurpose;
  final String? receivingInstitution;
  final DateTime? submissionDeadline;
  final String? transcriptPurpose;
  final String? deliveryMethod;
  final String status;
  final DateTime requestDate;
  final String? adminComment;

  LetterRequest({
    required this.id,
    required this.fullName,
    required this.email,
    required this.registrationNumber,
    required this.phoneNumber,
    required this.programOfStudy,
    required this.yearOfStudy,
    required this.letterType,
    required this.reasonForRequest,
    this.effectiveDate,
    this.organizationName,
    this.startDate,
    this.endDate,
    this.researchTitle,
    this.recommendationPurpose,
    this.receivingInstitution,
    this.submissionDeadline,
    this.transcriptPurpose,
    this.deliveryMethod,
    required this.status,
    required this.requestDate,
    this.adminComment,
  });

  factory LetterRequest.fromJson(Map<String, dynamic> json) {
    return LetterRequest(
      id: json['id'] ?? '',
      fullName: json['fullName'] ?? '',
      email: json['email'] ?? '',
      registrationNumber: json['registrationNumber'] ?? '',
      phoneNumber: json['phoneNumber'] ?? '',
      programOfStudy: json['programOfStudy'] ?? '',
      yearOfStudy: json['yearOfStudy'] ?? 0,
      letterType: json['letterType'] ?? '',
      reasonForRequest: json['reasonForRequest'] ?? '',
      effectiveDate: json['effectiveDate'] != null ? DateTime.tryParse(json['effectiveDate'].toString()) : null,
      organizationName: json['organizationName'],
      startDate: json['startDate'] != null ? DateTime.tryParse(json['startDate'].toString()) : null,
      endDate: json['endDate'] != null ? DateTime.tryParse(json['endDate'].toString()) : null,
      researchTitle: json['researchTitle'],
      recommendationPurpose: json['recommendationPurpose'],
      receivingInstitution: json['receivingInstitution'],
      submissionDeadline: json['submissionDeadline'] != null ? DateTime.tryParse(json['submissionDeadline'].toString()) : null,
      transcriptPurpose: json['transcriptPurpose'],
      deliveryMethod: json['deliveryMethod'],
      status: json['status'] ?? '',
      requestDate: DateTime.tryParse(json['requestDate'].toString()) ?? DateTime.now(),
      adminComment: json['adminComment'],
    );
  }
} 