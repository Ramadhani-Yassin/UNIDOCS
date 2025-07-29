import 'package:flutter/material.dart';
import 'password_reset_service.dart';
import 'forgot_password_screen.dart';
import 'main.dart' show kPrimaryColor, kAccentColor, kErrorColor, kSuccessColor, kBackgroundColor, kCardColor, kTextPrimary, kTextSecondary, kBorderColor;

class ResetPasswordScreen extends StatefulWidget {
  final String resetToken;
  final VoidCallback? onBackToLogin;
  
  const ResetPasswordScreen({
    Key? key,
    required this.resetToken,
    this.onBackToLogin,
  }) : super(key: key);

  @override
  State<ResetPasswordScreen> createState() => _ResetPasswordScreenState();
}

class _ResetPasswordScreenState extends State<ResetPasswordScreen> {
  final TextEditingController _newPasswordController = TextEditingController();
  final TextEditingController _confirmPasswordController = TextEditingController();
  final _formKey = GlobalKey<FormState>();
  
  bool _isLoading = false;
  bool _isValidating = true;
  bool _tokenValid = false;
  String? _message;
  bool _isError = false;
  bool _isSuccess = false;
  String _passwordRequirements = '';
  
  // Password validation states
  bool _hasMinLength = false;
  bool _hasUppercase = false;
  bool _hasLowercase = false;
  bool _hasDigit = false;
  bool _hasSpecialChar = false;

  @override
  void initState() {
    super.initState();
    _validateToken();
    _loadPasswordRequirements();
    _newPasswordController.addListener(_validatePassword);
  }

  @override
  void dispose() {
    _newPasswordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  Future<void> _validateToken() async {
    try {
      final result = await PasswordResetService.validateResetToken(widget.resetToken);
      
      setState(() {
        _isValidating = false;
        _tokenValid = result['valid'] ?? false;
        if (!_tokenValid) {
          _message = result['message'] ?? 'Invalid or expired reset token';
          _isError = true;
        }
      });
    } catch (e) {
      setState(() {
        _isValidating = false;
        _tokenValid = false;
        _message = 'Failed to validate reset token';
        _isError = true;
      });
    }
  }

  Future<void> _loadPasswordRequirements() async {
    try {
      final result = await PasswordResetService.getPasswordRequirements();
      if (result['success']) {
        setState(() {
          _passwordRequirements = result['requirements'];
        });
      }
    } catch (e) {
      // Use default requirements if API fails
      setState(() {
        _passwordRequirements = 'Password must be at least 8 characters long and contain uppercase, lowercase, digit, and special character.';
      });
    }
  }

  void _validatePassword() {
    final password = _newPasswordController.text;
    
    setState(() {
      _hasMinLength = password.length >= 8;
      _hasUppercase = password.contains(RegExp(r'[A-Z]'));
      _hasLowercase = password.contains(RegExp(r'[a-z]'));
      _hasDigit = password.contains(RegExp(r'[0-9]'));
      _hasSpecialChar = password.contains(RegExp(r'[!@#$%^&*()_+\-=\[\]{};:,.<>?]'));
    });
  }

  bool get _isPasswordValid {
    return _hasMinLength && _hasUppercase && _hasLowercase && _hasDigit && _hasSpecialChar;
  }

  Future<void> _submitResetPassword() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    if (!_isPasswordValid) {
      setState(() {
        _message = 'Password does not meet all requirements';
        _isError = true;
      });
      return;
    }

    setState(() {
      _isLoading = true;
      _message = null;
      _isError = false;
      _isSuccess = false;
    });

    try {
      final result = await PasswordResetService.resetPassword(
        widget.resetToken,
        _newPasswordController.text,
        _confirmPasswordController.text,
      );
      
      setState(() {
        _isLoading = false;
        _message = result['message'];
        _isSuccess = result['success'];
        _isError = !result['success'];
      });

      if (_isSuccess) {
        // Show success message and redirect after delay
        Future.delayed(const Duration(seconds: 3), () {
          if (widget.onBackToLogin != null) {
            widget.onBackToLogin!();
          } else {
            Navigator.of(context).pop();
          }
        });
      }
    } catch (e) {
      setState(() {
        _isLoading = false;
        _message = 'An unexpected error occurred. Please try again.';
        _isError = true;
        _isSuccess = false;
      });
    }
  }

  Widget _buildPasswordRequirement(String text, bool isMet) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          Icon(
            isMet ? Icons.check_circle : Icons.circle_outlined,
            color: isMet ? kSuccessColor : kTextSecondary,
            size: 16,
          ),
          const SizedBox(width: 8),
          Text(
            text,
            style: TextStyle(
              color: isMet ? kSuccessColor : kTextSecondary,
              fontSize: 14,
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_isValidating) {
      return Scaffold(
        backgroundColor: kBackgroundColor,
        appBar: AppBar(
          title: const Text(
            'Reset Password',
            style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600),
          ),
          backgroundColor: kPrimaryColor,
          elevation: 0,
        ),
        body: Container(
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
              colors: [kPrimaryColor, kBackgroundColor],
              stops: [0.0, 0.3],
            ),
          ),
          child: const Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                CircularProgressIndicator(
                  valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                ),
                SizedBox(height: 16),
                Text(
                  'Validating reset link...',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 16,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ),
        ),
      );
    }

    if (!_tokenValid) {
      return Scaffold(
        backgroundColor: kBackgroundColor,
        appBar: AppBar(
          title: const Text(
            'Invalid Link',
            style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600),
          ),
          backgroundColor: kErrorColor,
          elevation: 0,
        ),
        body: Container(
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
              colors: [kErrorColor, kBackgroundColor],
              stops: [0.0, 0.3],
            ),
          ),
          child: SafeArea(
            child: Padding(
              padding: const EdgeInsets.all(24.0),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    padding: const EdgeInsets.all(24),
                    decoration: BoxDecoration(
                      color: kCardColor,
                      borderRadius: BorderRadius.circular(16),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.1),
                          blurRadius: 10,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: Column(
                      children: [
                        Icon(
                          Icons.error_outline,
                          size: 64,
                          color: kErrorColor,
                        ),
                        const SizedBox(height: 16),
                        Text(
                          'Invalid Reset Link',
                          style: TextStyle(
                            fontSize: 24,
                            fontWeight: FontWeight.bold,
                            color: kTextPrimary,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          _message ?? 'This reset link has expired or is invalid.',
                          style: TextStyle(
                            fontSize: 16,
                            color: kTextSecondary,
                          ),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 24),
                        ElevatedButton(
                          onPressed: () {
                            if (widget.onBackToLogin != null) {
                              widget.onBackToLogin!();
                            } else {
                              Navigator.of(context).pop();
                            }
                          },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: kPrimaryColor,
                            foregroundColor: Colors.white,
                          ),
                          child: const Text('Back to Login'),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      );
    }

    return Scaffold(
      backgroundColor: kBackgroundColor,
      appBar: AppBar(
        title: const Text(
          'Reset Password',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600),
        ),
        backgroundColor: kPrimaryColor,
        elevation: 0,
      ),
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [kPrimaryColor, kBackgroundColor],
            stops: [0.0, 0.3],
          ),
        ),
        child: SafeArea(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const SizedBox(height: 20),
                
                // Header
                Container(
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    color: kCardColor,
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.1),
                        blurRadius: 10,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Column(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: kPrimaryColor.withOpacity(0.1),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(
                          Icons.lock_reset,
                          size: 48,
                          color: kPrimaryColor,
                        ),
                      ),
                      const SizedBox(height: 16),
                      Text(
                        'Set New Password',
                        style: TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                          color: kTextPrimary,
                        ),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Enter your new password below',
                        style: TextStyle(
                          fontSize: 16,
                          color: kTextSecondary,
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ],
                  ),
                ),
                
                const SizedBox(height: 24),
                
                // Form
                Container(
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    color: kCardColor,
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.1),
                        blurRadius: 10,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Form(
                    key: _formKey,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        // New Password Field
                        TextFormField(
                          controller: _newPasswordController,
                          obscureText: true,
                          decoration: const InputDecoration(
                            labelText: 'New Password',
                            hintText: 'Enter your new password',
                            prefixIcon: Icon(Icons.lock_outline),
                            border: OutlineInputBorder(),
                          ),
                          validator: (value) {
                            if (value == null || value.trim().isEmpty) {
                              return 'Please enter a new password';
                            }
                            if (!_isPasswordValid) {
                              return 'Password does not meet requirements';
                            }
                            return null;
                          },
                        ),
                        
                        const SizedBox(height: 16),
                        
                        // Confirm Password Field
                        TextFormField(
                          controller: _confirmPasswordController,
                          obscureText: true,
                          decoration: const InputDecoration(
                            labelText: 'Confirm Password',
                            hintText: 'Confirm your new password',
                            prefixIcon: Icon(Icons.lock_outline),
                            border: OutlineInputBorder(),
                          ),
                          validator: (value) {
                            if (value == null || value.trim().isEmpty) {
                              return 'Please confirm your password';
                            }
                            if (value != _newPasswordController.text) {
                              return 'Passwords do not match';
                            }
                            return null;
                          },
                        ),
                        
                        const SizedBox(height: 24),
                        
                        // Password Requirements
                        Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: kBackgroundColor,
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(color: kBorderColor),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Password Requirements:',
                                style: TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.w600,
                                  color: kTextPrimary,
                                ),
                              ),
                              const SizedBox(height: 12),
                              _buildPasswordRequirement('At least 8 characters long', _hasMinLength),
                              _buildPasswordRequirement('At least one uppercase letter (A-Z)', _hasUppercase),
                              _buildPasswordRequirement('At least one lowercase letter (a-z)', _hasLowercase),
                              _buildPasswordRequirement('At least one digit (0-9)', _hasDigit),
                              _buildPasswordRequirement('At least one special character (!@#\$%^&*)', _hasSpecialChar),
                            ],
                          ),
                        ),
                        
                        const SizedBox(height: 24),
                        
                        // Message Display
                        if (_message != null)
                          Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: _isSuccess ? kSuccessColor.withOpacity(0.1) : kErrorColor.withOpacity(0.1),
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(
                                color: _isSuccess ? kSuccessColor : kErrorColor,
                                width: 1,
                              ),
                            ),
                            child: Row(
                              children: [
                                Icon(
                                  _isSuccess ? Icons.check_circle : Icons.error,
                                  color: _isSuccess ? kSuccessColor : kErrorColor,
                                ),
                                const SizedBox(width: 8),
                                Expanded(
                                  child: Text(
                                    _message!,
                                    style: TextStyle(
                                      color: _isSuccess ? kSuccessColor : kErrorColor,
                                      fontWeight: FontWeight.w500,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        
                        const SizedBox(height: 24),
                        
                        // Submit Button
                        ElevatedButton(
                          onPressed: (_isLoading || !_isPasswordValid) ? null : _submitResetPassword,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: kPrimaryColor,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(vertical: 16),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(8),
                            ),
                          ),
                          child: _isLoading
                              ? const SizedBox(
                                  height: 20,
                                  width: 20,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2,
                                    valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                                  ),
                                )
                              : const Text(
                                  'Reset Password',
                                  style: TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                        ),
                        
                        const SizedBox(height: 16),
                        
                        // Navigation Links
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            TextButton(
                              onPressed: _isLoading
                                  ? null
                                  : () {
                                      if (widget.onBackToLogin != null) {
                                        widget.onBackToLogin!();
                                      } else {
                                        Navigator.of(context).pop();
                                      }
                                    },
                              child: const Text(
                                'Back to Login',
                                style: TextStyle(color: kPrimaryColor),
                              ),
                            ),
                            TextButton(
                              onPressed: _isLoading
                                  ? null
                                  : () {
                                      Navigator.of(context).pushReplacement(
                                        MaterialPageRoute(
                                          builder: (context) => const ForgotPasswordScreen(),
                                        ),
                                      );
                                    },
                              child: const Text(
                                'Request New Link',
                                style: TextStyle(color: kAccentColor),
                              ),
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
      ),
    );
  }
} 