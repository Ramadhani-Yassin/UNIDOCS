import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'main.dart';
import 'package:intl/intl.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:url_launcher/url_launcher.dart';

class AnalyticsScreen extends StatefulWidget {
  const AnalyticsScreen({Key? key}) : super(key: key);
  @override
  State<AnalyticsScreen> createState() => _AnalyticsScreenState();
}

class _AnalyticsScreenState extends State<AnalyticsScreen> {
  bool isLoading = true;
  String? errorMessage;
  Map<String, dynamic>? analyticsData;
  List<dynamic> recentRequests = [];
  String selectedRange = '30';
  final List<Map<String, String>> rangeOptions = [
    {'label': 'Last 7 Days', 'value': '7'},
    {'label': 'Last 30 Days', 'value': '30'},
    {'label': 'Last 90 Days', 'value': '90'},
    {'label': 'Last Year', 'value': '365'},
  ];

  @override
  void initState() {
    super.initState();
    _fetchAnalytics();
  }

  Future<void> _fetchAnalytics() async {
    setState(() { isLoading = true; errorMessage = null; });
    try {
      final prefs = await SharedPreferences.getInstance();
      final userJson = prefs.getString('currentUser');
      if (userJson == null) throw Exception('No user session');
      final user = jsonDecode(userJson);
      final email = user['email'];
      final response = await http.get(Uri.parse('http://10.103.236.248:8088/api/letter-requests/analytics/$email?range=$selectedRange'));
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        setState(() {
          analyticsData = data;
          recentRequests = data['recentRequests'] ?? [];
          isLoading = false;
        });
      } else {
        setState(() {
          errorMessage = 'Failed to load analytics.';
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

  String _formatDateRobust(dynamic date) {
    if (date == null) return '-';
    try {
      if (date is String) {
        final dt = DateTime.parse(date);
        return DateFormat('dd MMM yyyy').format(dt);
      } else if (date is List && date.length >= 3) {
        final dt = DateTime(date[0], date[1], date[2]);
        return DateFormat('dd MMM yyyy').format(dt);
      } else {
        return date.toString();
      }
    } catch (_) {
      return '-';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SizedBox(height: 48),
        Row(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Icon(Icons.analytics, color: Colors.deepPurple, size: 32),
            const SizedBox(width: 8),
            Text('Analytics', style: TextStyle(fontSize: 26, fontWeight: FontWeight.bold)),
            const Spacer(),
            DropdownButton<String>(
              value: selectedRange,
              items: rangeOptions.map((opt) => DropdownMenuItem<String>(
                value: opt['value'],
                child: Text(opt['label']!),
              )).toList(),
              onChanged: (v) {
                if (v != null) {
                  setState(() { selectedRange = v; });
                  _fetchAnalytics();
                }
              },
            ),
            IconButton(
              icon: Icon(Icons.refresh),
              onPressed: isLoading ? null : _fetchAnalytics,
              tooltip: 'Refresh',
            ),
          ],
        ),
        const SizedBox(height: 16),
        Expanded(
          child: isLoading
              ? Center(child: CircularProgressIndicator())
              : errorMessage != null
                  ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(errorMessage!, style: TextStyle(color: Colors.red)),
                          const SizedBox(height: 16),
                          InkWell(
                            onTap: () => launchUrl(Uri.parse('mailto:unidocs.ramadhani@gmail.com?subject=Analytics%20Support')),
                            child: Text('Contact Support', style: TextStyle(color: Colors.blue, decoration: TextDecoration.underline)),
                          ),
                        ],
                      ),
                    )
                  : SingleChildScrollView(
                      padding: const EdgeInsets.all(16.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          SingleChildScrollView(
                            scrollDirection: Axis.horizontal,
                            child: Row(
                              children: [
                                _summaryCard('Total', analyticsData?['totalRequests'] ?? 0, Icons.insert_drive_file, Colors.blue[100]!, Colors.blue[800]! ),
                                _summaryCard('Approved', analyticsData?['approvedRequests'] ?? 0, Icons.check_circle, Colors.green[100]!, Colors.green[800]! ),
                                _summaryCard('Pending', analyticsData?['pendingRequests'] ?? 0, Icons.hourglass_empty, Colors.orange[100]!, Colors.orange[800]! ),
                                _summaryCard('Rejected', analyticsData?['rejectedRequests'] ?? 0, Icons.cancel, Colors.red[100]!, Colors.red[800]! ),
                              ].map((w) => Padding(padding: const EdgeInsets.only(right: 12), child: w)).toList(),
                            ),
                          ),
                          const SizedBox(height: 24),
                          SingleChildScrollView(
                            scrollDirection: Axis.horizontal,
                            child: Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                SizedBox(
                                  width: 340,
                                  child: _buildStatusChart(),
                                ),
                                const SizedBox(width: 24),
                                SizedBox(
                                  width: 340,
                                  child: _buildLetterTypeChart(),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 32),
                          Text('Recent Requests', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                          const SizedBox(height: 12),
                          _buildRecentRequestsTable(),
                        ],
                      ),
                    ),
        ),
      ],
    );
  }

  Widget _summaryCard(String label, int value, IconData icon, Color bg, Color fg) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      color: bg,
      child: Container(
        width: 120,
        padding: const EdgeInsets.symmetric(vertical: 18, horizontal: 8),
        child: Column(
          children: [
            Icon(icon, color: fg, size: 32),
            const SizedBox(height: 8),
            Text('$value', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: fg)),
            Text(label, style: TextStyle(fontSize: 15, color: fg)),
          ],
        ),
      ),
    );
  }

  Widget _buildLetterTypeChart() {
    final dist = analyticsData?['letterTypeDistribution'] ?? {};
    final labels = dist.keys.toList();
    final values = labels.map((k) => (dist[k] as num?)?.toDouble() ?? 0.0).toList();
    final colors = [
      Color(0xFF1976D2), // blue
      Color(0xFF43A047), // green
      Color(0xFFFFA000), // amber
      Color(0xFF8E24AA), // purple
      Color(0xFFD32F2F), // red
      Color(0xFF00897B), // teal
      Color(0xFF6D4C41), // brown
      Color(0xFFEC407A), // pink
    ];
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: SizedBox(
          height: 340,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Letter Type Distribution', style: TextStyle(fontWeight: FontWeight.bold)),
              Text('Distribution of requests by letter type', style: TextStyle(fontSize: 13, color: Colors.grey[700])),
              const SizedBox(height: 8),
              Expanded(
                child: SingleChildScrollView(
                  child: Column(
                    children: [
                      SizedBox(
                        height: 160,
                        child: values.isEmpty
                            ? Center(child: Text('No data'))
                            : PieChart(
                                PieChartData(
                                  sections: [
                                    for (int i = 0; i < labels.length; i++)
                                      PieChartSectionData(
                                        color: colors[i % colors.length],
                                        value: values[i],
                                        title: '',
                                        radius: 50,
                                        titleStyle: TextStyle(fontSize: 0),
                                      ),
                                  ],
                                  sectionsSpace: 2,
                                  centerSpaceRadius: 24,
                                ),
                              ),
                      ),
                      const SizedBox(height: 12),
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children: [
                          for (int i = 0; i < labels.length; i++)
                            Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Container(width: 12, height: 12, color: colors[i % colors.length]),
                                const SizedBox(width: 4),
                                Text(labels[i], style: TextStyle(fontSize: 13)),
                              ],
                            ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatusChart() {
    final dist = analyticsData?['statusDistribution'] ?? {};
    final labels = ['Approved', 'Pending', 'Rejected'];
    final values = [
      (dist['approved'] as num?)?.toDouble() ?? 0.0,
      (dist['pending'] as num?)?.toDouble() ?? 0.0,
      (dist['rejected'] as num?)?.toDouble() ?? 0.0,
    ];
    final colors = [Color(0xFF43A047), Color(0xFFFFA000), Color(0xFFD32F2F)];
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: SizedBox(
          height: 340,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Request Status', style: TextStyle(fontWeight: FontWeight.bold)),
              Text('Breakdown of request statuses', style: TextStyle(fontSize: 13, color: Colors.grey[700])),
              const SizedBox(height: 8),
              Expanded(
                child: SingleChildScrollView(
                  child: Column(
                    children: [
                      SizedBox(
                        height: 160,
                        child: values.every((v) => v == 0)
                            ? Center(child: Text('No data'))
                            : PieChart(
                                PieChartData(
                                  sections: [
                                    for (int i = 0; i < labels.length; i++)
                                      PieChartSectionData(
                                        color: colors[i],
                                        value: values[i],
                                        title: '',
                                        radius: 50,
                                        titleStyle: TextStyle(fontSize: 0),
                                      ),
                                  ],
                                  sectionsSpace: 2,
                                  centerSpaceRadius: 24,
                                ),
                              ),
                      ),
                      const SizedBox(height: 12),
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children: [
                          for (int i = 0; i < labels.length; i++)
                            Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Container(width: 12, height: 12, color: colors[i]),
                                const SizedBox(width: 4),
                                Text(labels[i], style: TextStyle(fontSize: 13)),
                              ],
                            ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildRecentRequestsTable() {
    if (recentRequests.isEmpty) {
      return Padding(
        padding: const EdgeInsets.all(24.0),
        child: Center(child: Text('No recent requests found')),
      );
    }
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: DataTable(
        showCheckboxColumn: false,
        columnSpacing: 16,
        dataRowColor: MaterialStateProperty.resolveWith<Color?>((Set<MaterialState> states) {
          if (states.contains(MaterialState.selected)) return Colors.deepPurple[50];
          return null;
        }),
        headingRowColor: MaterialStateProperty.all(Colors.deepPurple[50]),
        columns: const [
          DataColumn(label: Text('Letter Type')),
          DataColumn(label: Text('Request Date')),
          DataColumn(label: Text('Status')),
        ],
        rows: List<DataRow>.generate(
          recentRequests.length,
          (index) {
            final req = recentRequests[index];
            final isEven = index % 2 == 0;
            return DataRow(
              color: MaterialStateProperty.all(isEven ? Colors.grey[50] : Colors.white),
              cells: [
                DataCell(Text(req['letterType'] ?? '', style: TextStyle(fontSize: 14))),
                DataCell(Text(_formatDateRobust(req['requestDate']), style: TextStyle(fontSize: 14))),
                DataCell(Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
                  decoration: BoxDecoration(
                    color: _statusColor(req['status']).withOpacity(0.15),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    req['status'] ?? '',
                    style: TextStyle(
                      color: _statusColor(req['status']),
                      fontWeight: FontWeight.bold,
                      fontSize: 14,
                    ),
                  ),
                )),
              ],
            );
          },
        ),
      ),
    );
  }
} 