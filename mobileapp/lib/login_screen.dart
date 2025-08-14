import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'main.dart' show kPrimaryColor;
import 'main.dart' show StudentHome;
import 'forgot_password_screen.dart';

class LoginScreen extends StatefulWidget {
  final VoidCallback? onLoginSuccess;
  const LoginScreen({Key? key, this.onLoginSuccess}) : super(key: key);

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  // Registration controllers
  final TextEditingController _regFirstNameController = TextEditingController();
  final TextEditingController _regLastNameController = TextEditingController();
  final TextEditingController _regEmailController = TextEditingController();
  final TextEditingController _regPasswordController = TextEditingController();

  bool _isLoading = false;
  String? _message;
  bool _isError = false;
  bool _showLogin = true;

  Future<void> _login() async {
    final email = _emailController.text.trim();
    final password = _passwordController.text.trim();
    if (email.isEmpty || password.isEmpty) {
      setState(() {
        _message = 'Please enter both email and password ❗️';
        _isError = true;
      });
      return;
    }
    setState(() {
      _isLoading = true;
      _message = null;
    });
    try {
      final response = await http.post(
        Uri.parse('http://10.14.79.248:8088/api/users/student-login'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'email': email, 'password': password}),
      );
      final data = jsonDecode(response.body);
      if (response.statusCode == 200 && data['user'] != null) {
        // Store user info and tokens
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('currentUser', jsonEncode(data['user']));
        if (data['token'] != null) {
          await prefs.setString('auth_token', data['token']);
        }
        if (data['refreshToken'] != null) {
          await prefs.setString('refresh_token', data['refreshToken']);
        }
        setState(() {
          _message = 'Login successful! Redirecting... ✅';
          _isError = false;
        });
        // Navigate to dashboard after short delay
        Future.delayed(const Duration(seconds: 1), () {
          if (widget.onLoginSuccess != null) {
            widget.onLoginSuccess!();
          } else {
          Navigator.of(context).pushReplacement(
            MaterialPageRoute(builder: (context) => const StudentHome()),
          );
          }
        });
      } else if (response.statusCode == 403 && data['error'] != null && data['error'].toString().contains('suspended')) {
        setState(() {
          _message = 'Your account is suspended. Please contact the Admin.';
          _isError = true;
        });
      } else {
        setState(() {
          _message = data['error'] ?? 'Invalid credentials ❌';
          _isError = true;
        });
      }
    } catch (e) {
      setState(() {
        _message = 'An error occurred. Please try again.';
        _isError = true;
      });
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  Future<void> _register() async {
    final firstName = _regFirstNameController.text.trim();
    final lastName = _regLastNameController.text.trim();
    final email = _regEmailController.text.trim();
    final password = _regPasswordController.text.trim();
    if (firstName.isEmpty || lastName.isEmpty || email.isEmpty || password.isEmpty) {
      setState(() {
        _message = 'Please fill all required fields';
        _isError = true;
      });
      return;
    }
    setState(() {
      _isLoading = true;
      _message = null;
    });
    try {
      final response = await http.post(
        Uri.parse('http://10.14.79.248:8088/api/users/register'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'firstName': firstName,
          'lastName': lastName,
          'email': email,
          'password': password,
          'role': 'student',
        }),
      );
      final data = jsonDecode(response.body);
      // Handle new backend response format
      if ((response.statusCode == 201 || response.statusCode == 200) && data['success'] == true) {
        setState(() {
          _message = data['message'] ?? 'Registration successful! Please login.';
          _isError = false; // Success = green
        });
        // Switch to login after short delay
        Future.delayed(const Duration(seconds: 1), () {
          setState(() {
            _showLogin = true;
            _message = null;
            _regFirstNameController.clear();
            _regLastNameController.clear();
            _regEmailController.clear();
            _regPasswordController.clear();
          });
        });
      } else {
        setState(() {
          _message = data['message'] ?? 'Registration failed. Invalid Email or Already used.';
          _isError = true; // Error = red
        });
      }
    } catch (e) {
      setState(() {
        _message = 'An error occurred. Please try again.';
        _isError = true;
      });
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Scaffold(
      backgroundColor: isDark ? Colors.grey[900] : const Color(0xFFE8EAF6),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Card(
                elevation: 8,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(24),
                ),
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.school, size: 48, color: kPrimaryColor),
                      const SizedBox(height: 12),
                      Text(
                        _showLogin ? 'Welcome Back!' : 'Create Your Account',
                        style: const TextStyle(
                          fontSize: 22,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        _showLogin
                            ? 'Login to access UNIDOCS features'
                            : 'Register to access UNIDOCS features',
                        style: TextStyle(
                          fontSize: 15,
                          color: Colors.grey[700],
                        ),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 24),
                      if (_showLogin) ...[
                        TextField(
                          controller: _emailController,
                          keyboardType: TextInputType.emailAddress,
                          decoration: const InputDecoration(
                            labelText: 'Email',
                            prefixIcon: Icon(Icons.email_outlined),
                            border: OutlineInputBorder(),
                          ),
                        ),
                        const SizedBox(height: 16),
                        TextField(
                          controller: _passwordController,
                          obscureText: true,
                          decoration: const InputDecoration(
                            labelText: 'Password',
                            prefixIcon: Icon(Icons.lock_outline),
                            border: OutlineInputBorder(),
                          ),
                        ),
                        const SizedBox(height: 24),
                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: kPrimaryColor,
                              padding: const EdgeInsets.symmetric(vertical: 14),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                            ),
                            onPressed: _isLoading ? null : _login,
                            child: _isLoading
                                ? const SizedBox(
                                    width: 24,
                                    height: 24,
                                    child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                                  )
                                : const Text('Login', style: TextStyle(fontSize: 16)),
                          ),
                        ),
                        const SizedBox(height: 16),
                        // Forgot Password Link
                        Align(
                          alignment: Alignment.center,
                          child: GestureDetector(
                            onTap: _isLoading ? null : () {
                              Navigator.of(context).push(
                                MaterialPageRoute(
                                  builder: (context) => const ForgotPasswordScreen(),
                                ),
                              );
                            },
                            child: Text(
                              'Forgot Password?',
                              style: TextStyle(
                                color: kPrimaryColor,
                                fontSize: 16,
                                fontWeight: FontWeight.w600,
                                decoration: TextDecoration.underline,
                              ),
                            ),
                          ),
                        ),
                       const SizedBox(height: 8),
                       _AnimatedLink(
                         text: "Don't have an account? Register",
                         color: kPrimaryColor,
                         onTap: _isLoading ? null : () {
                           setState(() {
                             _showLogin = false;
                             _message = null;
                           });
                         },
                       ),
                      ] else ...[
                        TextField(
                          controller: _regFirstNameController,
                          decoration: const InputDecoration(
                            labelText: 'First Name',
                            prefixIcon: Icon(Icons.person_outline),
                            border: OutlineInputBorder(),
                          ),
                        ),
                        const SizedBox(height: 16),
                        TextField(
                          controller: _regLastNameController,
                          decoration: const InputDecoration(
                            labelText: 'Last Name',
                            prefixIcon: Icon(Icons.person_outline),
                            border: OutlineInputBorder(),
                          ),
                        ),
                        const SizedBox(height: 16),
                        TextField(
                          controller: _regEmailController,
                          keyboardType: TextInputType.emailAddress,
                          decoration: const InputDecoration(
                            labelText: 'Email',
                            prefixIcon: Icon(Icons.email_outlined),
                            border: OutlineInputBorder(),
                          ),
                        ),
                        const SizedBox(height: 16),
                        TextField(
                          controller: _regPasswordController,
                          obscureText: true,
                          decoration: const InputDecoration(
                            labelText: 'Password',
                            prefixIcon: Icon(Icons.lock_outline),
                            border: OutlineInputBorder(),
                          ),
                        ),
                        const SizedBox(height: 24),
                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: kPrimaryColor,
                              padding: const EdgeInsets.symmetric(vertical: 14),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                            ),
                            onPressed: _isLoading ? null : _register,
                            child: _isLoading
                                ? const SizedBox(
                                    width: 24,
                                    height: 24,
                                    child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                                  )
                                : const Text('Register', style: TextStyle(fontSize: 16)),
                          ),
                        ),
                       const SizedBox(height: 8),
                       _AnimatedLink(
                         text: 'Already have an account? Login',
                         color: kPrimaryColor,
                         onTap: _isLoading ? null : () {
                           setState(() {
                             _showLogin = true;
                             _message = null;
                           });
                         },
                       ),
                      ],
                      if (_message != null)
                        Padding(
                          padding: const EdgeInsets.only(top: 16.0),
                          child: Text(
                            _message!,
                            style: TextStyle(
                              color: _isError ? Colors.red : Colors.green,
                              fontWeight: FontWeight.bold,
                              fontSize: 15,
                            ),
                            textAlign: TextAlign.center,
                          ),
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
}

class _AnimatedLink extends StatefulWidget {
  final String text;
  final Color color;
  final VoidCallback? onTap;
  const _AnimatedLink({required this.text, required this.color, this.onTap});
  @override
  State<_AnimatedLink> createState() => _AnimatedLinkState();
}

class _AnimatedLinkState extends State<_AnimatedLink> {
  bool _pressed = false;
  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTapDown: (_) => setState(() => _pressed = true),
      onTapUp: (_) => setState(() => _pressed = false),
      onTapCancel: () => setState(() => _pressed = false),
      onTap: widget.onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 80),
        margin: EdgeInsets.only(left: _pressed ? 8 : 0),
        child: Text(
          widget.text,
          style: TextStyle(
            color: widget.color,
            fontWeight: FontWeight.bold,
            fontSize: 15,
            // No underline
          ),
        ),
      ),
    );
  }
} 