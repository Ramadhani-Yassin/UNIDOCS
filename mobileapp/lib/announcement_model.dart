class Announcement {
  final String id;
  final String title;
  final String content;
  final String status;
  final DateTime createdDate;
  final String? author;
  final List<AnnouncementAttachment>? attachments;

  Announcement({
    required this.id,
    required this.title,
    required this.content,
    required this.status,
    required this.createdDate,
    this.author,
    this.attachments,
  });

  factory Announcement.fromJson(Map<String, dynamic> json) {
    return Announcement(
      id: json['id']?.toString() ?? '',
      title: json['title'] ?? '',
      content: json['content'] ?? '',
      status: json['status'] ?? '',
      createdDate: DateTime.tryParse(json['createdDate'].toString()) ?? DateTime.now(),
      author: json['author'],
      attachments: json['attachments'] != null
          ? (json['attachments'] as List)
              .map((a) => AnnouncementAttachment.fromJson(a))
              .toList()
          : null,
    );
  }
}

class AnnouncementAttachment {
  final String fileName;
  final String fileUrl;

  AnnouncementAttachment({required this.fileName, required this.fileUrl});

  factory AnnouncementAttachment.fromJson(Map<String, dynamic> json) {
    return AnnouncementAttachment(
      fileName: json['fileName'] ?? '',
      fileUrl: json['fileUrl'] ?? '',
    );
  }
} 