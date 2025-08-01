import 'package:http/http.dart' as http;
import 'dart:convert';

class PasswordResetService {
  static const String baseUrl = 'http://10.75.52.248:8088/api/users';

  // Request password reset
  static Future<Map<String, dynamic>> forgotPassword(String email) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/forgot-password'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'email': email}),
      );

      final data = jsonDecode(response.body);
      
      if (response.statusCode == 200) {
        return {
          'success': true,
          'message': data['message'] ?? 'Password reset email sent successfully',
        };
      } else {
        return {
          'success': false,
          'message': data['error'] ?? 'Failed to send password reset email',
        };
      }
    } catch (e) {
      return {
        'success': false,
        'message': 'Network error. Please check your connection.',
      };
    }
  }

  // Reset password with token
  static Future<Map<String, dynamic>> resetPassword(
    String resetToken,
    String newPassword,
    String confirmPassword,
  ) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/reset-password'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'resetToken': resetToken,
          'newPassword': newPassword,
          'confirmPassword': confirmPassword,
        }),
      );

      final data = jsonDecode(response.body);
      
      if (response.statusCode == 200) {
        return {
          'success': true,
          'message': data['message'] ?? 'Password reset successfully',
        };
      } else {
        return {
          'success': false,
          'message': data['error'] ?? 'Failed to reset password',
        };
      }
    } catch (e) {
      return {
        'success': false,
        'message': 'Network error. Please check your connection.',
      };
    }
  }

  // Validate reset token
  static Future<Map<String, dynamic>> validateResetToken(String token) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/validate-reset-token?token=$token'),
        headers: {'Content-Type': 'application/json'},
      );

      final data = jsonDecode(response.body);
      
      if (response.statusCode == 200) {
        return {
          'success': true,
          'valid': data['valid'] ?? false,
          'message': data['message'] ?? 'Token validation completed',
        };
      } else {
        return {
          'success': false,
          'valid': false,
          'message': data['error'] ?? 'Failed to validate token',
        };
      }
    } catch (e) {
      return {
        'success': false,
        'valid': false,
        'message': 'Network error. Please check your connection.',
      };
    }
  }

  // Get password requirements
  static Future<Map<String, dynamic>> getPasswordRequirements() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/password-requirements'),
        headers: {'Content-Type': 'application/json'},
      );

      final data = jsonDecode(response.body);
      
      if (response.statusCode == 200) {
        return {
          'success': true,
          'requirements': data['requirements'] ?? 'Password requirements not available',
        };
      } else {
        return {
          'success': false,
          'requirements': 'Failed to load password requirements',
        };
      }
    } catch (e) {
      return {
        'success': false,
        'requirements': 'Network error. Please check your connection.',
      };
    }
  }
} 