import 'package:flutter/material.dart';
import 'login_screen.dart';
import 'letter_request_service.dart';
import 'letter_request_model.dart';
import 'package:intl/intl.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import 'package:url_launcher/url_launcher.dart';
import 'package:flutter/services.dart';
import 'dart:io' as http;
import 'package:http/http.dart' as http;

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'UNIDOCS',
      theme: ThemeData(
        primarySwatch: Colors.deepPurple,
      ),
      home: const SplashScreen(),
      debugShowCheckedModeBanner: false,
    );
  }
}

class SplashScreen extends StatefulWidget {
  const SplashScreen({Key? key}) : super(key: key);

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  void initState() {
    super.initState();
    _checkLogin();
  }

  Future<void> _checkLogin() async {
    await Future.delayed(const Duration(seconds: 2));
    final prefs = await SharedPreferences.getInstance();
    final user = prefs.getString('currentUser');
    if (user != null) {
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (context) => const StudentHome()),
      );
    } else {
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (context) => LoginScreen(onLoginSuccess: () {
          Navigator.of(context).pushReplacement(
            MaterialPageRoute(builder: (context) => const StudentHome()),
          );
        })),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[200],
      body: Center(
        child: Container(
          width: 160,
          height: 160,
          decoration: BoxDecoration(
            color: Colors.white,
            shape: BoxShape.circle,
            boxShadow: [
              BoxShadow(
                color: Colors.black12,
                blurRadius: 16,
                offset: Offset(0, 8),
              ),
            ],
          ),
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: ClipOval(
              child: Image.asset(
                'lib/logo/logo.png',
                fit: BoxFit.cover,
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class StudentHome extends StatefulWidget {
  const StudentHome({Key? key}) : super(key: key);

  @override
  State<StudentHome> createState() => _StudentHomeState();
}

class _StudentHomeState extends State<StudentHome> {
  int _selectedIndex = 0;

  static const List<Widget> _screens = <Widget>[
    DashboardScreen(),
    LetterApplicationsScreen(),
    AllApplicationsScreen(),
    CVGeneratorScreen(),
    AnalyticsScreen(),
    AnnouncementsScreen(),
    SettingsScreen(),
    LogoutScreen(),
  ];

  void _onItemTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _screens[_selectedIndex],
      bottomNavigationBar: BottomNavigationBar(
        type: BottomNavigationBarType.fixed,
        currentIndex: _selectedIndex,
        onTap: _onItemTapped,
        selectedItemColor: Colors.deepPurple,
        unselectedItemColor: Colors.grey,
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.dashboard),
            label: 'Dashboard',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.edit_document),
            label: 'Letter Applications',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.folder_copy),
            label: 'All Applications',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.description),
            label: 'CV Generator',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.analytics),
            label: 'Analytics',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.campaign),
            label: 'Announcements',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.settings),
            label: 'Settings',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.logout),
            label: 'Logout',
          ),
        ],
      ),
    );
  }
}

// Placeholder screens for each section
class DashboardScreen extends StatefulWidget {
  const DashboardScreen({Key? key}) : super(key: key);
  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  final LetterRequestService _service = LetterRequestService();
  String fullName = 'Loading...';
  String? userEmail;
  int requestCount = 0;
  int animatedRequestCount = 0;
  bool isLoading = true;
  String? errorMessage;
  List<LetterRequest> recentRequests = [];
  bool recentRequestsLoading = true;

  @override
  void initState() {
    super.initState();
    _loadUserDataAndDashboard();
  }

  Future<void> _loadUserDataAndDashboard() async {
    final prefs = await SharedPreferences.getInstance();
    final userJson = prefs.getString('currentUser');
    if (userJson != null) {
      final user = jsonDecode(userJson);
      setState(() {
        fullName = '${user['firstName'] ?? ''} ${user['lastName'] ?? ''}'.trim();
        userEmail = user['email'];
      });
      _loadRequestCount();
      _loadRecentRequests();
    } else {
      setState(() {
        fullName = 'Unknown';
        userEmail = null;
      });
    }
  }

  void _loadRequestCount() async {
    if (userEmail == null) return;
    setState(() {
      isLoading = true;
      errorMessage = null;
    });
    try {
      final count = await _service.getRequestCount(userEmail!);
      setState(() {
        requestCount = count;
        _animateRequestCount(count);
        isLoading = false;
      });
    } catch (e) {
      setState(() {
        errorMessage = 'Failed to load request count';
        isLoading = false;
      });
    }
  }

  void _animateRequestCount(int target) {
    const duration = Duration(milliseconds: 1000);
    const frameRate = 30;
    final totalFrames = (duration.inMilliseconds / (1000 / frameRate)).round();
    int frame = 0;
    animatedRequestCount = 0;
    Future.doWhile(() async {
      await Future.delayed(Duration(milliseconds: (1000 / frameRate).round()));
      frame++;
      final progress = frame / totalFrames;
      setState(() {
        animatedRequestCount = (progress * target).floor();
      });
      if (progress >= 1) {
        setState(() {
          animatedRequestCount = target;
        });
        return false;
      }
      return true;
    });
  }

  void _loadRecentRequests() async {
    if (userEmail == null) return;
    setState(() {
      recentRequestsLoading = true;
    });
    try {
      final requests = await _service.getRecentRequests(userEmail!, limit: 10);
      setState(() {
        recentRequests = requests;
        recentRequestsLoading = false;
      });
    } catch (e) {
      setState(() {
        recentRequestsLoading = false;
      });
    }
  }

  String _formatDate(DateTime? date) {
    if (date == null) return '-';
    return DateFormat('yyyy-MM-dd').format(date);
  }

  Color _statusColor(String status) {
    switch (status.toLowerCase()) {
      case 'approved':
        return Colors.green;
      case 'declined':
      case 'rejected':
        return Colors.red;
      case 'pending':
      default:
        return Colors.orange;
    }
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SizedBox(height: 32), // Extra spacing above header
          Row(
            children: [
              Icon(Icons.dashboard, color: Colors.deepPurple, size: 32),
              const SizedBox(width: 8),
              Text('Dashboard', style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold)),
            ],
          ),
          const SizedBox(height: 16),
          Card(
            elevation: 4,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            child: Padding(
              padding: const EdgeInsets.all(20.0),
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Hello 👋', style: TextStyle(fontSize: 18)),
                        const SizedBox(height: 2),
                        Text(
                          fullName,
                          style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                  Column(
                    children: [
                      Icon(Icons.mail, color: Colors.deepPurple),
                      const SizedBox(height: 4),
                      isLoading
                          ? CircularProgressIndicator(strokeWidth: 2)
                          : errorMessage != null
                              ? Text(errorMessage!, style: TextStyle(color: Colors.red))
                              : Text('$animatedRequestCount', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
                      Text('Letters Requested', style: TextStyle(fontSize: 12)),
                    ],
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 24),
          // Add back the table title, aligned left
          Align(
            alignment: Alignment.centerLeft,
            child: Padding(
              padding: const EdgeInsets.only(left: 4.0, bottom: 4.0),
              child: Text('Recent Applications', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            ),
          ),
          Center(
            child: ConstrainedBox(
              constraints: BoxConstraints(maxWidth: 600),
              child: Card(
                elevation: 2,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                child: recentRequestsLoading
                    ? Padding(
                        padding: const EdgeInsets.all(24.0),
                        child: Center(child: CircularProgressIndicator()),
                      )
                    : recentRequests.isEmpty
                        ? Padding(
                            padding: const EdgeInsets.all(24.0),
                            child: Center(child: Text('No letter requests found')),
                          )
                        : DataTable(
                            showCheckboxColumn: false,
                            columnSpacing: 16,
                            columns: const [
                              DataColumn(label: Text('Letter Type')),
                              DataColumn(
                                label: SizedBox(
                                  width: 110,
                                  child: Text('Request Date', style: TextStyle(fontSize: 13)),
                                ),
                              ),
                              DataColumn(
                                label: SizedBox(
                                  width: 90,
                                  child: Text('Status', style: TextStyle(fontSize: 13)),
                                ),
                              ),
                            ],
                            rows: recentRequests.map((req) {
                              return DataRow(
                                cells: [
                                  DataCell(Text(_displayLetterType(req.letterType))),
                                  DataCell(
                                    Padding(
                                      padding: const EdgeInsets.symmetric(horizontal: 2),
                                      child: Text(_formatDate(req.requestDate), style: TextStyle(fontSize: 13)),
                                    ),
                                  ),
                                  DataCell(
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
                                      decoration: BoxDecoration(
                                        color: _statusColor(req.status).withOpacity(0.15),
                                        borderRadius: BorderRadius.circular(8),
                                      ),
                                      child: Text(
                                        req.status,
                                        style: TextStyle(
                                          color: _statusColor(req.status),
                                          fontWeight: FontWeight.bold,
                                          fontSize: 13,
                                        ),
                                      ),
                                    ),
                                  ),
                                ],
                              );
                            }).toList(),
                          ),
              ),
            ),
          ),
          // Removed Quick Letter Requests section
        ],
      ),
    );
  }

  Widget _quickLetterTile(String title) {
    return GestureDetector(
      onTap: () {
        // TODO: Navigate to letter application form for this type
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
        decoration: BoxDecoration(
          color: Colors.deepPurple[50],
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: Colors.deepPurple[100]!),
        ),
        child: Text(title, style: TextStyle(fontSize: 15, color: Colors.deepPurple[900])),
      ),
    );
  }

  String _displayLetterType(String type) {
    switch (type) {
      case 'feasibility_study':
        return 'Feasibility Study';
      case 'introduction':
        return 'Introduction Letter';
      case 'recommendation':
        return 'Recommendation Letter';
      case 'postponement':
        return 'Postponement';
      case 'discontinuation':
        return 'Discontinuation Letter';
      default:
        return type.replaceAll('_', ' ').replaceFirstMapped(RegExp(r'\b\w'), (m) => m.group(0)!.toUpperCase());
    }
  }
}

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
      print('Request body: ${jsonEncode(requestData)}');
      final response = await http.post(
        Uri.parse('http://10.185.224.248:8088/api/letter-requests'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(requestData),
      );
      print('Status: ${response.statusCode}');
      print('Body: ${response.body}');
      final data = jsonDecode(response.body);
      if (response.statusCode == 201 || response.statusCode == 200) {
        setState(() {
          _showSuccessModal = true;
        });
        _formKey.currentState!.reset();
      } else {
        setState(() {
          _errorMessage = data['error'] ?? data['message'] ?? 'Failed to submit request.';
        });
      }
    } catch (e) {
      print('Submission error: $e');
      setState(() {
        _errorMessage = 'An error occurred. Please try again. ($e)';
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
                    const SizedBox(height: 32), // Extra spacing above header
                    Row(
                      children: [
                        Icon(Icons.edit_document, color: Colors.deepPurple, size: 32),
                        const SizedBox(width: 8),
                        Text('Request Letter', style: TextStyle(fontSize: 26, fontWeight: FontWeight.bold)),
                      ],
                    ),
                    const SizedBox(height: 20),
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

  Widget _buildDateField(String label, {required FormFieldSetter<String> onSaved}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12.0),
      child: TextFormField(
        decoration: InputDecoration(
          labelText: label,
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
        ),
        readOnly: true,
        onTap: () async {
          final picked = await showDatePicker(
            context: context,
            initialDate: DateTime.now(),
            firstDate: DateTime(2000),
            lastDate: DateTime(2100),
          );
          if (picked != null) {
            onSaved(picked.toIso8601String().split('T').first);
            setState(() {});
          }
        },
        onSaved: onSaved,
      ),
    );
  }

  Widget _buildEffectiveDateField() {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12.0),
      child: TextFormField(
        controller: _effectiveDateController,
        decoration: InputDecoration(
          labelText: 'Effective Date',
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
        ),
        readOnly: true,
        validator: _requiredValidator,
        onTap: () async {
          final picked = await showDatePicker(
            context: context,
            initialDate: effectiveDate.isNotEmpty ? DateTime.parse(effectiveDate) : DateTime.now(),
            firstDate: DateTime(2000),
            lastDate: DateTime(2100),
          );
          if (picked != null) {
            setState(() {
              effectiveDate = picked.toIso8601String().split('T').first;
              _effectiveDateController.text = effectiveDate;
            });
          }
        },
        onSaved: (v) {
          effectiveDate = v ?? '';
        },
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
}

class AllApplicationsScreen extends StatefulWidget {
  const AllApplicationsScreen({Key? key}) : super(key: key);
  @override
  State<AllApplicationsScreen> createState() => _AllApplicationsScreenState();
}

class _AllApplicationsScreenState extends State<AllApplicationsScreen> {
  final LetterRequestService _service = LetterRequestService();
  String? userEmail;
  List<LetterRequest> allRequests = [];
  bool isLoading = true;
  String searchTerm = '';
  String letterTypeFilter = 'all';
  List<String> letterTypes = ['all'];

  @override
  void initState() {
    super.initState();
    _loadUserDataAndRequests();
  }

  Future<void> _loadUserDataAndRequests() async {
    final prefs = await SharedPreferences.getInstance();
    final userJson = prefs.getString('currentUser');
    if (userJson != null) {
      final user = jsonDecode(userJson);
      setState(() {
        userEmail = user['email'];
      });
      _loadAllRequests();
    }
  }

  void _loadAllRequests() async {
    if (userEmail == null) return;
    setState(() {
      isLoading = true;
    });
    try {
      final response = await http.get(Uri.parse('http://10.185.224.248:8088/api/letter-requests/all/$userEmail'));
      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        final requests = data.map((json) => LetterRequest.fromJson(json)).toList();
        // Build letterTypes list
        final typesSet = <String>{};
        for (var r in requests) {
          if (r.letterType.isEmpty) continue;
          final type = r.letterType.trim().toLowerCase();
          if (type == 'discontinuation') continue;
          if (type == 'transcript' || type == 'scholarship') {
            typesSet.add('recommendation');
          } else {
            typesSet.add(type);
          }
        }
        setState(() {
          allRequests = requests;
          letterTypes = ['all', ...typesSet];
          isLoading = false;
        });
      } else {
        setState(() {
          isLoading = false;
        });
      }
    } catch (e) {
      setState(() {
        isLoading = false;
      });
    }
  }

  List<LetterRequest> get filteredRequests {
    List<LetterRequest> filtered = allRequests;
    if (letterTypeFilter != 'all') {
      filtered = filtered.where((r) {
        final type = r.letterType.trim().toLowerCase();
        if (type == 'transcript' || type == 'scholarship') {
          return letterTypeFilter == 'recommendation';
        }
        if (type == 'discontinuation') return false;
        return type == letterTypeFilter;
      }).toList();
    }
    if (searchTerm.isEmpty) return filtered;
    final term = searchTerm.toLowerCase();
    return filtered.where((r) =>
      (r.fullName.toLowerCase().contains(term)) ||
      (r.letterType.toLowerCase().contains(term)) ||
      (r.status.toLowerCase().contains(term)) ||
      (r.adminComment != null && r.adminComment!.toLowerCase().contains(term))
    ).toList();
  }

  String _formatDate(DateTime? date) {
    if (date == null) return '-';
    return DateFormat('yyyy-MM-dd').format(date);
  }

  Color _statusColor(String status) {
    switch (status.toLowerCase()) {
      case 'approved':
        return Colors.green;
      case 'declined':
      case 'rejected':
        return Colors.red;
      case 'pending':
      default:
        return Colors.orange;
    }
  }

  String _displayLetterType(String type) {
    switch (type) {
      case 'feasibility_study':
        return 'Feasibility Study';
      case 'introduction':
        return 'Introduction Letter';
      case 'recommendation':
        return 'Recommendation Letter';
      case 'postponement':
        return 'Postponement';
      case 'discontinuation':
        return 'Discontinuation Letter';
      default:
        return type.replaceAll('_', ' ').replaceFirstMapped(RegExp(r'\b\w'), (m) => m.group(0)!.toUpperCase());
    }
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SizedBox(height: 32), // Extra spacing above header
          Row(
            children: [
              Icon(Icons.folder_copy, color: Colors.deepPurple, size: 32),
              const SizedBox(width: 8),
              Text('All Applications', style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold)),
            ],
          ),
          const SizedBox(height: 24),
          Align(
            alignment: Alignment.centerLeft,
            child: Padding(
              padding: const EdgeInsets.only(left: 4.0, bottom: 4.0),
              child: Text('All Requests', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            ),
          ),
          // Filter/search bar
          Padding(
            padding: const EdgeInsets.only(bottom: 16.0, left: 4.0, right: 4.0),
            child: Row(
              children: [
                Icon(Icons.search, color: Colors.deepPurple),
                const SizedBox(width: 8),
                Expanded(
                  child: TextField(
                    decoration: InputDecoration(
                      hintText: 'Search letter requests...',
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 0),
                    ),
                    onChanged: (v) => setState(() => searchTerm = v),
                  ),
                ),
                const SizedBox(width: 12),
                DropdownButton<String>(
                  value: letterTypeFilter,
                  items: letterTypes.map((type) {
                    return DropdownMenuItem<String>(
                      value: type,
                      child: Text(type == 'all' ? 'All Types' : type[0].toUpperCase() + type.substring(1)),
                    );
                  }).toList(),
                  onChanged: (v) => setState(() => letterTypeFilter = v ?? 'all'),
                ),
              ],
            ),
          ),
          Center(
            child: ConstrainedBox(
              constraints: BoxConstraints(maxWidth: 600),
              child: Card(
                elevation: 2,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                child: isLoading
                    ? Padding(
                        padding: const EdgeInsets.all(24.0),
                        child: Center(child: CircularProgressIndicator()),
                      )
                    : filteredRequests.isEmpty
                        ? Padding(
                            padding: const EdgeInsets.all(24.0),
                            child: Center(child: Text('No letter requests found')),
                          )
                        : DataTable(
                            showCheckboxColumn: false,
                            columnSpacing: 16,
                            columns: const [
                              DataColumn(label: Text('Letter Type')),
                              DataColumn(
                                label: SizedBox(
                                  width: 110,
                                  child: Text('Request Date', style: TextStyle(fontSize: 13)),
                                ),
                              ),
                              DataColumn(
                                label: SizedBox(
                                  width: 90,
                                  child: Text('Status', style: TextStyle(fontSize: 13)),
                                ),
                              ),
                            ],
                            rows: filteredRequests.map((req) {
                              return DataRow(
                                cells: [
                                  DataCell(Text(_displayLetterType(req.letterType))),
                                  DataCell(
                                    Padding(
                                      padding: const EdgeInsets.symmetric(horizontal: 2),
                                      child: Text(_formatDate(req.requestDate), style: TextStyle(fontSize: 13)),
                                    ),
                                  ),
                                  DataCell(
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
                                      decoration: BoxDecoration(
                                        color: _statusColor(req.status).withOpacity(0.15),
                                        borderRadius: BorderRadius.circular(8),
                                      ),
                                      child: Text(
                                        req.status,
                                        style: TextStyle(
                                          color: _statusColor(req.status),
                                          fontWeight: FontWeight.bold,
                                          fontSize: 13,
                                        ),
                                      ),
                                    ),
                                  ),
                                ],
                              );
                            }).toList(),
                          ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class CVGeneratorScreen extends StatelessWidget {
  const CVGeneratorScreen({Key? key}) : super(key: key);
  @override
  Widget build(BuildContext context) {
    return Center(child: Text('CV Generator', style: TextStyle(fontSize: 24)));
  }
}

class AnalyticsScreen extends StatelessWidget {
  const AnalyticsScreen({Key? key}) : super(key: key);
  @override
  Widget build(BuildContext context) {
    return Center(child: Text('Analytics', style: TextStyle(fontSize: 24)));
  }
}

class AnnouncementsScreen extends StatelessWidget {
  const AnnouncementsScreen({Key? key}) : super(key: key);
  @override
  Widget build(BuildContext context) {
    return Center(child: Text('Announcements', style: TextStyle(fontSize: 24)));
  }
}

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({Key? key}) : super(key: key);
  @override
  Widget build(BuildContext context) {
    return Center(child: Text('Settings', style: TextStyle(fontSize: 24)));
  }
}

class LogoutScreen extends StatelessWidget {
  const LogoutScreen({Key? key}) : super(key: key);
  @override
  Widget build(BuildContext context) {
    return Center(child: Text('Logout', style: TextStyle(fontSize: 24)));
  }
}

