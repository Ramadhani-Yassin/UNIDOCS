import 'dart:convert';
import 'package:http/http.dart' as http;
import 'announcement_model.dart';

class AnnouncementService {
  final String baseUrl = 'http://10.14.79.248:8088/api/announcements';

  Future<List<Announcement>> getRecentAnnouncements({int limit = 5}) async {
    final response = await http.get(Uri.parse('$baseUrl/recent?limit=$limit'));
    if (response.statusCode == 200) {
      final List<dynamic> data = jsonDecode(response.body);
      return data.map((json) => Announcement.fromJson(json)).toList();
    } else {
      throw Exception('Failed to load announcements');
    }
  }

  Future<List<Announcement>> getAllAnnouncements() async {
    final response = await http.get(Uri.parse(baseUrl));
    if (response.statusCode == 200) {
      final List<dynamic> data = jsonDecode(response.body);
      return data.map((json) => Announcement.fromJson(json)).toList();
    } else {
      throw Exception('Failed to load announcements');
    }
  }
} 