import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'main.dart';
import 'letter_request_model.dart';
import 'package:intl/intl.dart';

class AllApplicationsScreen extends StatefulWidget {
  const AllApplicationsScreen({Key? key}) : super(key: key);
  @override
  State<AllApplicationsScreen> createState() => _AllApplicationsScreenState();
}

class _AllApplicationsScreenState extends State<AllApplicationsScreen> {
  String? userEmail;
  List<LetterRequest> allRequests = [];
  bool isLoading = true;
  String searchTerm = '';
  String letterTypeFilter = 'all';
  List<String> letterTypes = ['all'];
  String? errorMessage;

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
      errorMessage = null;
    });
    try {
              final response = await http.get(Uri.parse('http://10.166.183.248:8088/api/letter-requests/all/$userEmail'));
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
          errorMessage = 'Failed to fetch requests.';
        });
      }
    } catch (e) {
      setState(() {
        isLoading = false;
        errorMessage = 'An error occurred.';
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
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SizedBox(height: 48),
        Row(
          children: [
            Icon(Icons.folder_copy, color: Colors.deepPurple, size: 32),
            const SizedBox(width: 8),
            Text('All Applications', style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold)),
          ],
        ),
        const SizedBox(height: 16),
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
        Expanded(
          child: isLoading
              ? Center(child: CircularProgressIndicator())
              : errorMessage != null
                  ? Center(child: Text(errorMessage!, style: TextStyle(color: Colors.red)))
                  : filteredRequests.isEmpty
                      ? Center(child: Text('No letter requests found.'))
                      : Center(
                          child: ConstrainedBox(
                            constraints: BoxConstraints(maxWidth: 600),
                            child: SingleChildScrollView(
                              scrollDirection: Axis.vertical,
                              child: Card(
                                elevation: 2,
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                child: SingleChildScrollView(
                                  scrollDirection: Axis.horizontal,
                                  child: DataTable(
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
                          ),
                        ),
        ),
      ],
    );
  }
} 