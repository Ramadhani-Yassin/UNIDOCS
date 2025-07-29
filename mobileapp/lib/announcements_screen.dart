import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'main.dart';
import 'announcement_model.dart';
import 'package:url_launcher/url_launcher.dart';

class AnnouncementsScreen extends StatefulWidget {
  const AnnouncementsScreen({Key? key}) : super(key: key);
  @override
  State<AnnouncementsScreen> createState() => _AnnouncementsScreenState();
}

class _AnnouncementsScreenState extends State<AnnouncementsScreen> {
  bool isLoading = true;
  String? errorMessage;
  List<Announcement> announcements = [];
  int expandedIndex = -1;

  @override
  void initState() {
    super.initState();
    _fetchAnnouncements();
  }

  Future<void> _fetchAnnouncements() async {
    setState(() { isLoading = true; errorMessage = null; });
    try {
              final response = await http.get(Uri.parse('http://10.103.236.248:8088/api/announcements/recent?limit=10'));
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        setState(() {
          announcements = (data as List).map((a) => Announcement.fromJson(a)).toList();
          isLoading = false;
        });
      } else {
        setState(() {
          errorMessage = 'Failed to load announcements.';
          isLoading = false;
        });
      }
    } catch (e) {
      setState(() {
        errorMessage = 'An error occurred. Please try again. ($e)';
        isLoading = false;
      });
    }
  }

  Color _statusColor(String? status) {
    switch ((status ?? '').toLowerCase()) {
      case 'important':
        return Colors.orange;
      case 'update':
        return Colors.blue;
      case 'new':
      default:
        return Colors.green;
    }
  }

  String _formatDate(DateTime? date) {
    if (date == null) return '-';
    try {
      return '${date.year}-${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')}';
    } catch (_) {
      return date.toString();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SizedBox(height: 48),
        Row(
          children: [
            Icon(Icons.campaign, color: Colors.deepPurple, size: 32),
            const SizedBox(width: 8),
            Text('Announcements', style: TextStyle(fontSize: 26, fontWeight: FontWeight.bold)),
          ],
        ),
        const SizedBox(height: 16),
        if (isLoading)
          const Expanded(child: Center(child: CircularProgressIndicator())),
        if (!isLoading && errorMessage != null)
          Expanded(child: Center(child: Text(errorMessage!, style: TextStyle(color: Colors.red)))),
        if (!isLoading && errorMessage == null && announcements.isEmpty)
          const Expanded(child: Center(child: Text('No announcements available'))),
        if (!isLoading && errorMessage == null && announcements.isNotEmpty)
          Expanded(
            child: ListView.builder(
              itemCount: announcements.length,
              itemBuilder: (context, idx) {
                final ann = announcements[idx];
                final isExpanded = expandedIndex == idx;
                return Card(
                  elevation: 3,
                  margin: const EdgeInsets.only(bottom: 16),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  child: InkWell(
                    borderRadius: BorderRadius.circular(16),
                    onTap: () {
                      setState(() { expandedIndex = isExpanded ? -1 : idx; });
                    },
                    child: Padding(
                      padding: const EdgeInsets.all(20.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Icon(Icons.campaign, color: Colors.deepPurple),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Text(ann.title, style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                              ),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                decoration: BoxDecoration(
                                  color: _statusColor(ann.status).withOpacity(0.15),
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: Text(
                                  (ann.status).toUpperCase(),
                                  style: TextStyle(
                                    color: _statusColor(ann.status),
                                    fontWeight: FontWeight.bold,
                                    fontSize: 13,
                                  ),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Row(
                            children: [
                              Icon(Icons.calendar_today, size: 16, color: Colors.grey[600]),
                              const SizedBox(width: 4),
                              Text(_formatDate(ann.createdDate)),
                              const SizedBox(width: 16),
                              Icon(Icons.person, size: 16, color: Colors.grey[600]),
                              const SizedBox(width: 4),
                              Text(ann.author ?? 'Admin'),
                            ],
                          ),
                          const SizedBox(height: 12),
                          Text(
                            ann.content,
                            maxLines: isExpanded ? null : 3,
                            overflow: isExpanded ? TextOverflow.visible : TextOverflow.ellipsis,
                            style: const TextStyle(fontSize: 15),
                          ),
                          if (isExpanded && ann.attachments != null && ann.attachments!.isNotEmpty) ...[
                            const SizedBox(height: 12),
                            const Text('Attachments:', style: TextStyle(fontWeight: FontWeight.bold)),
                            for (var att in ann.attachments!)
                              Padding(
                                padding: const EdgeInsets.only(top: 4.0),
                                child: InkWell(
                                  onTap: () => launchUrl(Uri.parse(att.fileUrl)),
                                  child: Row(
                                    children: [
                                      const Icon(Icons.attach_file, size: 18, color: Colors.deepPurple),
                                      const SizedBox(width: 4),
                                      Flexible(child: Text(att.fileName, style: TextStyle(decoration: TextDecoration.underline, color: Colors.blue))),
                                    ],
                                  ),
                                ),
                              ),
                          ],
                        ],
                      ),
                    ),
                  ),
                );
              },
            ),
          ),
      ],
    );
  }
} 