import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'main.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({Key? key}) : super(key: key);
  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  final _formKey = GlobalKey<FormState>();
  String firstName = '';
  String lastName = '';
  String email = '';
  String currentPassword = '';
  int? userId;
  bool isLoading = false;
  bool showAlert = false;
  String alertType = 'success';
  String successMessage = 'Profile updated successfully!';
  String errorMessage = 'Error updating profile. Please try again.';

  @override
  void initState() {
    super.initState();
    _loadUserData();
  }

  Future<void> _loadUserData() async {
    final prefs = await SharedPreferences.getInstance();
    final userJson = prefs.getString('currentUser');
    if (userJson != null) {
      final user = jsonDecode(userJson);
      setState(() {
        firstName = user['firstName'] ?? '';
        lastName = user['lastName'] ?? '';
        email = user['email'] ?? '';
        userId = user['id'] is int ? user['id'] : int.tryParse(user['id'].toString());
      });
    }
  }

  Future<void> _onSubmit() async {
    setState(() {
      isLoading = true;
      showAlert = false;
    });
    if (!email.contains('@')) {
      setState(() {
        isLoading = false;
        showAlert = true;
        alertType = 'danger';
        errorMessage = 'Please enter a valid email address.';
      });
      return;
    }
    if (currentPassword.isEmpty) {
      setState(() {
        isLoading = false;
        showAlert = true;
        alertType = 'danger';
        errorMessage = 'Password is required to save changes.';
      });
      return;
    }
    if (userId == null) {
      setState(() {
        isLoading = false;
        showAlert = true;
        alertType = 'danger';
        errorMessage = 'User not found.';
      });
      return;
    }
    final updateData = {
      'firstName': firstName,
      'lastName': lastName,
      'email': email,
      'currentPassword': currentPassword,
    };
    try {
      final response = await http.put(
        Uri.parse('http://10.103.236.248:8088/api/users/$userId'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(updateData),
      );
      if (response.statusCode == 200) {
        final updatedUser = jsonDecode(response.body);
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('currentUser', jsonEncode(updatedUser));
        setState(() {
          isLoading = false;
          showAlert = true;
          alertType = 'success';
          successMessage = 'Profile updated successfully!';
          firstName = updatedUser['firstName'] ?? firstName;
          lastName = updatedUser['lastName'] ?? lastName;
          email = updatedUser['email'] ?? email;
        });
      } else {
        final data = jsonDecode(response.body);
        setState(() {
          isLoading = false;
          showAlert = true;
          alertType = 'danger';
          errorMessage = data['error'] ?? 'Error updating profile. Please try again.';
        });
      }
    } catch (e) {
      setState(() {
        isLoading = false;
        showAlert = true;
        alertType = 'danger';
        errorMessage = 'An error occurred. Please try again.';
      });
    }
  }

  void _resetForm() {
    _loadUserData();
    setState(() {
      currentPassword = '';
      showAlert = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SizedBox(height: 48),
        Row(
          children: [
            Icon(Icons.settings, color: Colors.deepPurple, size: 32),
            const SizedBox(width: 8),
            Text('Settings', style: TextStyle(fontSize: 26, fontWeight: FontWeight.bold)),
          ],
        ),
        const SizedBox(height: 16),
        Expanded(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(16.0),
            child: Center(
              child: ConstrainedBox(
                constraints: BoxConstraints(maxWidth: 700),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    if (showAlert)
                      Padding(
                        padding: const EdgeInsets.only(bottom: 16.0),
                        child: Container(
                          width: double.infinity,
                          decoration: BoxDecoration(
                            color: alertType == 'success' ? Colors.green[100] : Colors.red[100],
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(color: alertType == 'success' ? Colors.green : Colors.red),
                          ),
                          padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
                          child: Row(
                            children: [
                              Icon(alertType == 'success' ? Icons.check_circle : Icons.error, color: alertType == 'success' ? Colors.green : Colors.red),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Text(
                                  alertType == 'success' ? successMessage : errorMessage,
                                  style: TextStyle(color: alertType == 'success' ? Colors.green[900] : Colors.red[900]),
                                ),
                              ),
                              IconButton(
                                icon: const Icon(Icons.close),
                                onPressed: () => setState(() => showAlert = false),
                              ),
                            ],
                          ),
                        ),
                      ),
                    LayoutBuilder(
                      builder: (context, constraints) {
                        final isWide = constraints.maxWidth > 600;
                        return isWide
                            ? Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Expanded(child: _buildForm()),
                                  const SizedBox(width: 32),
                                  SizedBox(width: 260, child: _buildInfoBox()),
                                ],
                              )
                            : Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  _buildForm(),
                                  const SizedBox(height: 24),
                                  _buildInfoBox(),
                                ],
                              );
                      },
                    ),
                    const SizedBox(height: 32),
                    _buildSupportBox(),
                  ],
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildForm() {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Update Personal Information', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              const SizedBox(height: 18),
              _buildTextField('First Name', initialValue: firstName, onChanged: (v) => setState(() => firstName = v), validator: (v) => v == null || v.isEmpty ? 'First name is required' : null),
              const SizedBox(height: 12),
              _buildTextField('Last Name', initialValue: lastName, onChanged: (v) => setState(() => lastName = v), validator: (v) => v == null || v.isEmpty ? 'Last name is required' : null),
              const SizedBox(height: 12),
              _buildTextField('Email Address', initialValue: email, onChanged: (v) => setState(() => email = v), validator: (v) => v == null || !v.contains('@') ? 'Valid email is required' : null),
              const SizedBox(height: 12),
              _buildTextField('Current Password', initialValue: currentPassword, onChanged: (v) => setState(() => currentPassword = v), validator: (v) => v == null || v.isEmpty ? 'Password is required to save changes' : null, obscureText: true, hint: 'Enter your password to confirm changes'),
              const SizedBox(height: 20),
              Row(
                children: [
                  Flexible(
                    child: ElevatedButton.icon(
                      onPressed: isLoading ? null : () {
                        if (_formKey.currentState!.validate()) _onSubmit();
                      },
                      icon: isLoading ? SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white)) : Icon(Icons.save),
                      label: Text(isLoading ? 'Saving...' : 'Save Changes'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: kPrimaryColor,
                        padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 18),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      ),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Flexible(
                    child: OutlinedButton.icon(
                      onPressed: isLoading ? null : _resetForm,
                      icon: Icon(Icons.refresh, color: kErrorColor),
                      label: Text('Discard', style: TextStyle(color: kErrorColor)),
                      style: OutlinedButton.styleFrom(
                        side: BorderSide(color: kErrorColor),
                        foregroundColor: kErrorColor,
                        backgroundColor: Colors.transparent,
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTextField(String label, {String? initialValue, required void Function(String) onChanged, String? Function(String?)? validator, bool obscureText = false, String? hint}) {
    return TextFormField(
      initialValue: initialValue,
      decoration: InputDecoration(
        labelText: label,
        hintText: hint,
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
      ),
      obscureText: obscureText,
      validator: validator,
      onChanged: onChanged,
    );
  }

  Widget _buildInfoBox() {
    return Card(
      elevation: 1,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(18.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Security Guidelines', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
            const SizedBox(height: 8),
            _buildBullet('Keep your information current - Ensure your details are always up-to-date.'),
            _buildBullet('Use a valid email - Important notifications will be sent to this address.'),
            _buildBullet('Never share your password - University staff will never ask for your password.'),
            _buildBullet('Verify email changes - Always verify new email addresses immediately.'),
          ],
        ),
      ),
    );
  }

  Widget _buildBullet(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('• ', style: TextStyle(fontSize: 16)),
          Expanded(child: Text(text, style: TextStyle(fontSize: 15))),
        ],
      ),
    );
  }

  Widget _buildSupportBox() {
    return Card(
      elevation: 1,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(18.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Need Help?', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
            const SizedBox(height: 8),
            Row(children: [Icon(Icons.phone, size: 18, color: Colors.deepPurple), const SizedBox(width: 6), Text('+255 621 060 107', style: TextStyle(fontSize: 15))]),
            const SizedBox(height: 4),
            Row(children: [Icon(Icons.email, size: 18, color: Colors.deepPurple), const SizedBox(width: 6), Text('unidocs.ramadhani@gmail.com', style: TextStyle(fontSize: 15))]),
            const SizedBox(height: 4),
            Row(children: [Icon(Icons.location_on, size: 18, color: Colors.deepPurple), const SizedBox(width: 6), Text('SUZA, School of Business', style: TextStyle(fontSize: 15))]),
          ],
        ),
      ),
    );
  }
} 