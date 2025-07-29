import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'main.dart';
import 'letter_request_model.dart';
import 'package:intl/intl.dart';

class LetterApplicationsScreen extends StatefulWidget {
  const LetterApplicationsScreen({Key? key}) : super(key: key);
  @override
  State<LetterApplicationsScreen> createState() => _LetterApplicationsScreenState();
}

class _LetterApplicationsScreenState extends State<LetterApplicationsScreen> {
  final _formKey = GlobalKey<FormState>();
  bool _isLoading = false;
  bool _showSuccessModal = false;
  String? _errorMessage;

  // User info
  String fullName = '';
  String email = '';

  // Form fields
  String regNumber = '';
  String phone = '';
  String program = '';
  String yearOfStudy = '';
  String selectedLetterType = '';
  String reason = '';
  String organizationName = '';
  String startDate = '';
  String endDate = '';
  String researchTitle = '';
  String feasibilityOrganization = '';
  String studyStartDate = '';
  String studyEndDate = '';
  String discontinuationReason = '';
  String effectiveDate = '';
  String recommendationPurpose = '';
  String receivingInstitution = '';
  String submissionDeadline = '';
  String transcriptPurpose = '';
  String deliveryMethod = '';

  // Dynamic field flags
  bool showIntroductionFields = false;
  bool showFeasibilityFields = false;
  bool showDiscontinuationFields = false;
  bool showRecommendationFields = false;
  bool showTranscriptFields = false;
  bool showReasonField = false;

  // Add a list for year options
  final List<String> yearOptions = ['1', '2', '3', '4', '5'];

  // Add controller for effective date
  final TextEditingController _effectiveDateController = TextEditingController();
  final TextEditingController _startDateController = TextEditingController();
  final TextEditingController _endDateController = TextEditingController();
  final TextEditingController _studyStartDateController = TextEditingController();
  final TextEditingController _studyEndDateController = TextEditingController();
  final TextEditingController _submissionDeadlineController = TextEditingController();

  bool _showModal = false;
  String _modalMessage = '';
  Color _modalColor = kInfoColor;
  bool _modalSuccess = false;

  @override
  void dispose() {
    _effectiveDateController.dispose();
    _startDateController.dispose();
    _endDateController.dispose();
    _studyStartDateController.dispose();
    _studyEndDateController.dispose();
    _submissionDeadlineController.dispose();
    super.dispose();
  }

  @override
  void initState() {
    super.initState();
    _loadUserData();
    _effectiveDateController.text = effectiveDate;
    _startDateController.text = startDate;
    _endDateController.text = endDate;
    _studyStartDateController.text = studyStartDate;
    _studyEndDateController.text = studyEndDate;
    _submissionDeadlineController.text = submissionDeadline;
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

  void _onLetterTypeChange(String? value) {
    setState(() {
      selectedLetterType = value ?? '';
      showIntroductionFields = false;
      showFeasibilityFields = false;
      showDiscontinuationFields = false;
      showRecommendationFields = false;
      showTranscriptFields = false;
      showReasonField = false;
      if (selectedLetterType == 'introduction') {
        showIntroductionFields = true;
      } else if (selectedLetterType == 'feasibility_study') {
        showFeasibilityFields = true;
      } else if (selectedLetterType == 'discontinuation') {
        showDiscontinuationFields = true;
      } else if (selectedLetterType == 'recommendation') {
        showRecommendationFields = true;
      } else if (selectedLetterType == 'transcript') {
        showTranscriptFields = true;
      } else if (selectedLetterType == 'postponement') {
        showReasonField = true;
      }
    });
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() {
      _isLoading = true;
      _errorMessage = null;
      _showModal = true;
      _modalMessage = 'Please wait, we are generating your request...';
      _modalColor = kInfoColor;
      _modalSuccess = false;
    });
    _formKey.currentState!.save();
    // Prepare request data, only include non-empty fields, send null otherwise
    final requestData = {
      'fullName': fullName,
      'email': email,
      'registrationNumber': regNumber,
      'phoneNumber': phone,
      'programOfStudy': program,
      'yearOfStudy': int.tryParse(yearOfStudy) ?? 1,
      'letterType': selectedLetterType,
      'reasonForRequest': (selectedLetterType == 'discontinuation' ? discontinuationReason : reason).isNotEmpty ? (selectedLetterType == 'discontinuation' ? discontinuationReason : reason) : null,
      'effectiveDate': effectiveDate.isNotEmpty ? effectiveDate : null,
      'organizationName': (selectedLetterType == 'feasibility_study' ? feasibilityOrganization : organizationName).isNotEmpty ? (selectedLetterType == 'feasibility_study' ? feasibilityOrganization : organizationName) : null,
      'startDate': (selectedLetterType == 'feasibility_study' ? studyStartDate : startDate).isNotEmpty ? (selectedLetterType == 'feasibility_study' ? studyStartDate : startDate) : null,
      'endDate': (selectedLetterType == 'feasibility_study' ? studyEndDate : endDate).isNotEmpty ? (selectedLetterType == 'feasibility_study' ? studyEndDate : endDate) : null,
      'researchTitle': researchTitle.isNotEmpty ? researchTitle : null,
      'recommendationPurpose': recommendationPurpose.isNotEmpty ? recommendationPurpose : null,
      'receivingInstitution': receivingInstitution.isNotEmpty ? receivingInstitution : null,
      'submissionDeadline': submissionDeadline.isNotEmpty ? submissionDeadline : null,
      'transcriptPurpose': transcriptPurpose.isNotEmpty ? transcriptPurpose : null,
      'deliveryMethod': deliveryMethod.isNotEmpty ? deliveryMethod : null,
    };
    try {
      final response = await http.post(
                  Uri.parse('http://10.166.183.248:8088/api/letter-requests'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(requestData),
      );
      final data = jsonDecode(response.body);
      if (response.statusCode == 201 || response.statusCode == 200) {
        setState(() {
          _showModal = true;
          _modalMessage = 'Refer to your email for a copy of your letter.';
          _modalColor = kSuccessColor;
          _modalSuccess = true;
        });
        _formKey.currentState!.reset();
        await Future.delayed(const Duration(seconds: 2));
        setState(() {
          _showModal = false;
        });
      } else {
        setState(() {
          _showModal = true;
          _modalMessage = data['error'] ?? data['message'] ?? 'Failed to submit request.';
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
        _showModal = true;
        _modalMessage = 'An error occurred. Please try again. ( [31m$e [0m)';
        _modalColor = kErrorColor;
        _modalSuccess = false;
      });
      await Future.delayed(const Duration(seconds: 2));
      setState(() {
        _showModal = false;
      });
    } finally {
      setState(() {
        _isLoading = false;
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
                Icon(Icons.edit_document, color: Colors.deepPurple, size: 32),
                const SizedBox(width: 8),
                Text('Request Letter', style: TextStyle(fontSize: 26, fontWeight: FontWeight.bold)),
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
                              _buildReadonlyField('Full Name', fullName),
                              _buildTextField('Registration Number', onSaved: (v) => regNumber = v!, validator: _requiredValidator, hint: 'e.g. BITA/6/22/079/TZ'),
                              _buildReadonlyField('Email Address', email),
                              _buildTextField('Phone Number', onSaved: (v) => phone = v!, validator: _requiredValidator, hint: 'Write Your Phone No:'),
                              _buildTextField('Program of Study', onSaved: (v) => program = v!, validator: _requiredValidator, hint: 'e.g. Bachelor\'s Degree in ICT with Accounting (BITA)'),
                              // Year of Study Dropdown (fixed)
                              Padding(
                                padding: const EdgeInsets.only(bottom: 12.0),
                                child: DropdownButtonFormField<String>(
                                  decoration: InputDecoration(
                                    labelText: 'Year of Study',
                                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                                  ),
                                  value: yearOfStudy.isNotEmpty ? yearOfStudy : null,
                                  items: yearOptions.map((opt) {
                                    return DropdownMenuItem<String>(
                                      value: opt,
                                      child: Text('$opt${_ordinal(opt)} Year'),
                                    );
                                  }).toList(),
                                  onChanged: (v) {
                                    setState(() { yearOfStudy = v ?? ''; });
                                  },
                                  onSaved: (v) => yearOfStudy = v ?? '',
                                  validator: _requiredValidator,
                                ),
                              ),
                              _buildDropdownField('Letter Type', [
                                'introduction',
                                'postponement',
                                'feasibility_study',
                                //'discontinuation',
                                'recommendation',
                                //'transcript',
                              ],
                              onChanged: _onLetterTypeChange,
                              onSaved: (v) => selectedLetterType = v ?? '',
                              validator: _requiredValidator,
                              displayNames: {
                                'introduction': 'Introduction Letter for Field',
                                'postponement': 'Postponement Request',
                                'feasibility_study': 'Feasibility Study',
                                //'discontinuation': 'Discontinuation Letter',
                                'recommendation': 'Recommendation Letter',
                                //'transcript': 'Transcript Request',
                              }),
                              if (showReasonField) ...[
                                _buildTextField('Reason for Request', onSaved: (v) => reason = v!, validator: _requiredValidator, maxLines: 3),
                                _buildDateFieldWithController('Effective Date', _effectiveDateController, (v) => effectiveDate = v ?? '', effectiveDate),
                              ],
                              if (showIntroductionFields) ...[
                                _buildTextField('Organization Name', onSaved: (v) => organizationName = v!, validator: _requiredValidator, hint: 'e.g. University of Dar es Salaam'),
                                _buildDateFieldWithController('Start Date', _startDateController, (v) => startDate = v ?? '', startDate),
                                _buildDateFieldWithController('End Date', _endDateController, (v) => endDate = v ?? '', endDate),
                              ],
                              if (showFeasibilityFields) ...[
                                _buildTextField('Research Title', onSaved: (v) => researchTitle = v!, validator: _requiredValidator, hint: 'e.g. Impact of ICT on Accounting Practices'),
                                _buildTextField('Organization Name', onSaved: (v) => feasibilityOrganization = v!, validator: _requiredValidator, hint: 'e.g. Department of Computer Science'),
                                _buildDateFieldWithController('Study Start Date', _studyStartDateController, (v) => studyStartDate = v ?? '', studyStartDate),
                                _buildDateFieldWithController('Study End Date', _studyEndDateController, (v) => studyEndDate = v ?? '', studyEndDate),
                              ],
                              if (showDiscontinuationFields) ...[
                                _buildTextField('Reason for Discontinuation', onSaved: (v) => discontinuationReason = v!, validator: _requiredValidator, maxLines: 3, hint: 'e.g. Financial Difficulties'),
                                _buildDateFieldWithController('Effective Date', _effectiveDateController, (v) => effectiveDate = v ?? '', effectiveDate),
                              ],
                              if (showRecommendationFields) ...[
                                _buildDropdownField('Purpose of Recommendation', [
                                  'scholarship', 'postgraduate', 'employment', 'internship'
                                ], onSaved: (v) => recommendationPurpose = v ?? '', validator: _requiredValidator, displayNames: {
                                  'scholarship': 'Scholarship Application',
                                  'postgraduate': 'Postgraduate Studies',
                                  'employment': 'Employment Application',
                                  'internship': 'Internship Application',
                                }),
                                _buildTextField('Receiving Institution', onSaved: (v) => receivingInstitution = v!, validator: _requiredValidator, hint: 'e.g. University of Dar es Salaam'),
                                _buildDateFieldWithController('Submission Deadline', _submissionDeadlineController, (v) => submissionDeadline = v ?? '', submissionDeadline),
                              ],
                              if (showTranscriptFields) ...[
                                _buildDropdownField('Purpose of Transcript', [
                                  'employment', 'further studies', 'scholarship', 'personal use'
                                ], onSaved: (v) => transcriptPurpose = v ?? '', validator: _requiredValidator),
                                _buildDropdownField('Delivery Method', [
                                  'pickup', 'email', 'post'
                                ], onSaved: (v) => deliveryMethod = v ?? '', validator: _requiredValidator),
                              ],
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
                                          : const Text('Submit Request', style: TextStyle(fontSize: 16)),
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
        if (_showSuccessModal)
          _buildSuccessModal(),
      ],
    );
  }

  Widget _buildReadonlyField(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: TextStyle(fontWeight: FontWeight.w500)),
          const SizedBox(height: 4),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
            decoration: BoxDecoration(
              color: Colors.grey[100],
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: Colors.grey[300]!),
            ),
            child: Text(value, style: TextStyle(fontSize: 15)),
          ),
        ],
      ),
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

  Widget _buildDropdownField(String label, List<String> options, {required FormFieldSetter<String?> onSaved, FormFieldValidator<String?>? validator, void Function(String?)? onChanged, Map<String, String>? displayNames}) {
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
        onChanged: onChanged,
        onSaved: onSaved,
        validator: validator,
      ),
    );
  }

  Widget _buildDateFieldWithController(String label, TextEditingController controller, FormFieldSetter<String> onSaved, String stateValue) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12.0),
      child: TextFormField(
        controller: controller,
        decoration: InputDecoration(
          labelText: label,
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
        ),
        readOnly: true,
        validator: _requiredValidator,
        onTap: () async {
          final picked = await showDatePicker(
            context: context,
            initialDate: stateValue.isNotEmpty ? DateTime.parse(stateValue) : DateTime.now(),
            firstDate: DateTime(2000),
            lastDate: DateTime(2100),
          );
          if (picked != null) {
            setState(() {
              final dateStr = picked.toIso8601String().split('T').first;
              controller.text = dateStr;
              onSaved(dateStr);
            });
          }
        },
        onSaved: (v) {
          onSaved(v ?? '');
        },
      ),
    );
  }

  String? _requiredValidator(String? value) {
    if (value == null || value.trim().isEmpty) {
      return 'This field is required';
    }
    return null;
  }

  Widget _buildSuccessModal() {
    return Positioned.fill(
      child: Container(
        color: Colors.black.withOpacity(0.3),
        child: Center(
          child: Container(
            padding: const EdgeInsets.all(32),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 16)],
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.check_circle, color: Colors.green, size: 48),
                const SizedBox(height: 16),
                Text('Application sent!', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
                const SizedBox(height: 8),
                Text('Refer to your email for letter copy.', style: TextStyle(fontSize: 16)),
                const SizedBox(height: 24),
                ElevatedButton(
                  onPressed: () {
                    setState(() { _showSuccessModal = false; });
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.deepPurple,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                  child: const Text('OK'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  String _ordinal(String value) {
    switch (value) {
      case '1': return 'st';
      case '2': return 'nd';
      case '3': return 'rd';
      default: return 'th';
    }
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