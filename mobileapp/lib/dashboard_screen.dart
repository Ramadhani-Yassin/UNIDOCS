import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import 'package:intl/intl.dart';
import 'letter_request_service.dart';
import 'letter_request_model.dart';
import 'main.dart';

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
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SizedBox(height: 48),
        Row(
          children: [
            Icon(Icons.dashboard, color: Colors.deepPurple, size: 32),
            const SizedBox(width: 8),
            Text('Dashboard', style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold)),
          ],
        ),
        const SizedBox(height: 16),
        Expanded(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
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
              ],
            ),
          ),
        ),
      ],
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