import 'dart:convert';
import 'package:http/http.dart' as http;
import 'letter_request_model.dart';

class LetterRequestService {
  final String baseUrl = 'http://10.14.79.248:8088/api/letter-requests';

  Future<int> getRequestCount(String email) async {
    final response = await http.get(Uri.parse('$baseUrl/count/$email'));
    if (response.statusCode == 200) {
      return int.tryParse(response.body) ?? 0;
    } else {
      throw Exception('Failed to load request count');
    }
  }

  Future<List<LetterRequest>> getRecentRequests(String email, {int limit = 5}) async {
    final response = await http.get(Uri.parse('$baseUrl/recent/$email?limit=$limit'));
    if (response.statusCode == 200) {
      final List<dynamic> data = jsonDecode(response.body);
      return data.map((json) => LetterRequest.fromJson(json)).toList();
    } else {
      throw Exception('Failed to load recent requests');
    }
  }
} 