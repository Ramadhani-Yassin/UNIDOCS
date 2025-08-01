import 'package:flutter/material.dart';
import 'login_screen.dart';
import 'dashboard_screen.dart';
import 'letter_applications_screen.dart';
import 'all_applications_screen.dart';
import 'cv_generator_screen.dart';
import 'analytics_screen.dart';
import 'announcements_screen.dart';
import 'settings_screen.dart';
import 'logout_screen.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'widgets/ai_chat_widget.dart';

// Define the new color palette
const Color kPrimaryColor = Color(0xFF283593); // Primary
const Color kAccentColor = Color(0xFF00ACC1); // Accent
const Color kSuccessColor = Color(0xFF43A047); // Success
const Color kErrorColor = Color(0xFFC62828); // Error
const Color kWarningColor = Color(0xFFFF8F00); // Warning
const Color kInfoColor = Color(0xFF039BE5); // Info
const Color kBackgroundColor = Color(0xFFF0F4F8); // Background
const Color kCardColor = Color(0xFFFFFFFF); // Card/Surface
const Color kTextPrimary = Color(0xFF263238); // Text - Primary
const Color kTextSecondary = Color(0xFF607D8B); // Text - Secondary
const Color kBorderColor = Color(0xFFCFD8DC); // Border/Divider

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
        primaryColor: kPrimaryColor,
        colorScheme: ColorScheme.fromSwatch().copyWith(
          primary: kPrimaryColor,
          secondary: kAccentColor,
          background: kBackgroundColor,
          error: kErrorColor,
        ),
        scaffoldBackgroundColor: kBackgroundColor,
        cardColor: kCardColor,
        dividerColor: kBorderColor,
        textTheme: ThemeData.light().textTheme.copyWith(
          titleLarge: TextStyle(color: kTextPrimary),
          bodyLarge: TextStyle(color: kTextPrimary),
          bodyMedium: TextStyle(color: kTextSecondary),
        ),
        iconTheme: IconThemeData(color: kPrimaryColor),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            backgroundColor: kPrimaryColor,
            foregroundColor: Colors.white,
            textStyle: const TextStyle(color: Colors.white),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
          ),
        ),
        outlinedButtonTheme: OutlinedButtonThemeData(
          style: OutlinedButton.styleFrom(
            foregroundColor: Colors.white,
            backgroundColor: kAccentColor,
            side: BorderSide(color: kPrimaryColor),
            textStyle: const TextStyle(color: Colors.white),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
          ),
        ),
        textButtonTheme: TextButtonThemeData(
          style: TextButton.styleFrom(
            foregroundColor: Colors.white,
            backgroundColor: kPrimaryColor,
            textStyle: const TextStyle(color: Colors.white),
          ),
        ),
        inputDecorationTheme: InputDecorationTheme(
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide(color: kBorderColor)),
          enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide(color: kBorderColor)),
          focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide(color: kPrimaryColor)),
          labelStyle: TextStyle(color: kTextSecondary),
        ),
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
      body: Stack(
        children: [
          _screens[_selectedIndex],
          // AI Chat Widget - available on all screens
          const AIChatWidget(),
        ],
      ),
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

