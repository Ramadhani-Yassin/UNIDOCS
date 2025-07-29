import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'main.dart';
import 'package:intl/intl.dart';
import 'package:url_launcher/url_launcher.dart';

class CVGeneratorScreen extends StatefulWidget {
  const CVGeneratorScreen({Key? key}) : super(key: key);
  @override
  State<CVGeneratorScreen> createState() => _CVGeneratorScreenState();
}

class _CVGeneratorScreenState extends State<CVGeneratorScreen> {
  final _formKey = GlobalKey<FormState>();
  bool _isLoading = false;
  String? _errorMessage;
  String? _successMessage;
  bool _showModal = false;
  String _modalMessage = '';
  Color _modalColor = kInfoColor;
  bool _modalSuccess = false;

  // Form fields
  String selectedTemplate = '';
  String fullName = '';
  String email = '';
  String phone = '';
  String address = '';
  String education = '';
  String experience = '';
  String skills = '';
  String about = '';

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
        fullName = '${user['firstName'] ?? ''} ${user['lastName'] ?? ''}'.trim();
        email = user['email'] ?? '';
      });
    }
  }

  String? _requiredValidator(String? value) {
    if (value == null || value.trim().isEmpty) {
      return 'This field is required';
    }
    return null;
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() {
      _isLoading = true;
      _errorMessage = null;
      _successMessage = null;
      _showModal = true;
      _modalMessage = 'Please wait, your CV is being generated...';
      _modalColor = kInfoColor;
      _modalSuccess = false;
    });
    _formKey.currentState!.save();
    final cvData = {
      'fullName': fullName,
      'email': email,
      'phoneNumber': phone,
      'address': address,
      'education': education,
      'experience': experience,
      'skills': skills,
      'about': about,
      'cvTemplate': selectedTemplate,
    };
    try {
      final response = await http.post(
                  Uri.parse('http://10.103.236.248:8088/api/cv-requests'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(cvData),
      );
      final data = jsonDecode(response.body);
      if (response.statusCode == 201 || response.statusCode == 200) {
        setState(() {
          _isLoading = false;
          _modalMessage = 'Refer to your email for CV copy.';
          _modalColor = kSuccessColor;
          _modalSuccess = true;
        });
        await Future.delayed(const Duration(seconds: 2));
        setState(() {
          _showModal = false;
        });
      } else {
        setState(() {
          _isLoading = false;
          _modalMessage = data['error'] ?? data['message'] ?? 'Failed to generate CV.';
          _modalColor = kErrorColor;
          _modalSuccess = false;
        });
        await Future.delayed(const Duration(seconds: 2));
        setState(() {
          _showModal = false;
        });
      }
    } catch (e) {
      setState(() {
        _isLoading = false;
        _modalMessage = 'An error occurred. Please try again. ($e)';
        _modalColor = kErrorColor;
        _modalSuccess = false;
      });
      await Future.delayed(const Duration(seconds: 2));
      setState(() {
        _showModal = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 48),
            Row(
              children: [
                Icon(Icons.description, color: Colors.deepPurple, size: 32),
                const SizedBox(width: 8),
                Text('CV Generator', style: TextStyle(fontSize: 26, fontWeight: FontWeight.bold)),
              ],
            ),
            const SizedBox(height: 16),
            Expanded(
              child: Stack(
                children: [
                  SingleChildScrollView(
                    padding: const EdgeInsets.all(16.0),
                    child: Center(
                      child: ConstrainedBox(
                        constraints: BoxConstraints(maxWidth: 600),
                        child: Form(
                          key: _formKey,
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              if (_errorMessage != null)
                                Padding(
                                  padding: const EdgeInsets.only(bottom: 12.0),
                                  child: Text(_errorMessage!, style: TextStyle(color: Colors.red)),
                                ),
                              if (_successMessage != null)
                                Padding(
                                  padding: const EdgeInsets.only(bottom: 12.0),
                                  child: Text(_successMessage!, style: TextStyle(color: Colors.green)),
                                ),
                              _buildDropdownField('Choose CV Template', ['classic', 'modern', 'creative'], (v) => selectedTemplate = v ?? '', validator: _requiredValidator, displayNames: {
                                'classic': 'Classic',
                                'modern': 'Modern',
                                'creative': 'Creative',
                              }),
                              _buildTextField('Full Name', onSaved: (v) => fullName = v!, validator: _requiredValidator, hint: 'Your full name'),
                              _buildTextField('Email Address', onSaved: (v) => email = v!, validator: _requiredValidator, hint: 'you@example.com'),
                              _buildTextField('Phone Number', onSaved: (v) => phone = v!, validator: _requiredValidator, hint: 'Your phone number'),
                              _buildTextField('Address', onSaved: (v) => address = v!, validator: _requiredValidator, hint: 'Your address'),
                              _buildTextField('Education', onSaved: (v) => education = v!, validator: _requiredValidator, hint: 'List your education, e.g. University, Degree, Year', maxLines: 3),
                              _buildTextField('Work Experience', onSaved: (v) => experience = v!, validator: _requiredValidator, hint: 'List your work experience', maxLines: 3),
                              _buildTextField('Skills', onSaved: (v) => skills = v!, validator: _requiredValidator, hint: 'e.g. Python, Communication, Leadership'),
                              _buildTextField('About Me / Profile Summary', onSaved: (v) => about = v ?? '', hint: 'Short summary about yourself', maxLines: 2),
                              const SizedBox(height: 18),
                              Row(
                                children: [
                                  Expanded(
                                    child: ElevatedButton(
                                      onPressed: _isLoading ? null : _submit,
                                      style: ElevatedButton.styleFrom(
                                        backgroundColor: Colors.deepPurple,
                                        padding: const EdgeInsets.symmetric(vertical: 14),
                                        shape: RoundedRectangleBorder(
                                          borderRadius: BorderRadius.circular(12),
                                        ),
                                      ),
                                      child: _isLoading
                                          ? const SizedBox(
                                              width: 24,
                                              height: 24,
                                              child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                                            )
                                          : const Text('Generate CV', style: TextStyle(fontSize: 16)),
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ),
                  if (_showModal) _buildModal(),
                ],
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildTextField(String label, {required FormFieldSetter<String> onSaved, FormFieldValidator<String>? validator, String? hint, int maxLines = 1}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12.0),
      child: TextFormField(
        decoration: InputDecoration(
          labelText: label,
          hintText: hint,
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
        ),
        maxLines: maxLines,
        validator: validator,
        onSaved: onSaved,
      ),
    );
  }

  Widget _buildDropdownField(String label, List<String> options, void Function(String?) onSaved, {FormFieldValidator<String?>? validator, Map<String, String>? displayNames}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12.0),
      child: DropdownButtonFormField<String>(
        decoration: InputDecoration(
          labelText: label,
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
        ),
        items: options.map((opt) {
          return DropdownMenuItem<String>(
            value: opt,
            child: Text(displayNames != null ? displayNames[opt] ?? opt : opt),
          );
        }).toList(),
        onChanged: onSaved,
        onSaved: onSaved,
        validator: validator,
      ),
    );
  }

  Widget _buildModal() {
    return Positioned.fill(
      child: Container(
        color: Colors.black.withOpacity(0.3),
        child: Center(
          child: Container(
            padding: const EdgeInsets.all(32),
            decoration: BoxDecoration(
              color: kCardColor,
              borderRadius: BorderRadius.circular(16),
              boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 16)],
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(_modalSuccess ? Icons.check_circle : Icons.info, color: _modalColor, size: 48),
                const SizedBox(height: 16),
                Text(_modalMessage, style: TextStyle(fontSize: 18, color: _modalColor, fontWeight: FontWeight.bold), textAlign: TextAlign.center),
                if (!_modalSuccess && _isLoading)
                  const Padding(
                    padding: EdgeInsets.only(top: 16.0),
                    child: CircularProgressIndicator(),
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }
} 