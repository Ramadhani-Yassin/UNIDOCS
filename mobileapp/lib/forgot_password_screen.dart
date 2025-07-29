import 'package:flutter/material.dart';
import 'password_reset_service.dart';
import 'main.dart' show kPrimaryColor, kAccentColor, kErrorColor, kSuccessColor, kBackgroundColor, kCardColor, kTextPrimary, kTextSecondary;

class ForgotPasswordScreen extends StatefulWidget {
  final VoidCallback? onBackToLogin;
  
  const ForgotPasswordScreen({Key? key, this.onBackToLogin}) : super(key: key);

  @override
  State<ForgotPasswordScreen> createState() => _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends State<ForgotPasswordScreen> {
  final TextEditingController _emailController = TextEditingController();
  final _formKey = GlobalKey<FormState>();
  
  bool _isLoading = false;
  String? _message;
  bool _isError = false;
  bool _isSuccess = false;

  @override
  void dispose() {
    _emailController.dispose();
    super.dispose();
  }

  Future<void> _submitForgotPassword() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    setState(() {
      _isLoading = true;
      _message = null;
      _isError = false;
      _isSuccess = false;
    });

    try {
      final result = await PasswordResetService.forgotPassword(_emailController.text.trim());
      
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: kBackgroundColor,
      appBar: AppBar(
        title: const Text(
          'Forgot Password',
          style: TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.w600,
          ),
        ),
        backgroundColor: kPrimaryColor,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () {
            if (widget.onBackToLogin != null) {
              widget.onBackToLogin!();
            } else {
              Navigator.of(context).pop();
            }
          },
        ),
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
                const SizedBox(height: 40),
                
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
                        'Reset Your Password',
                        style: TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                          color: kTextPrimary,
                        ),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Enter your email address and we\'ll send you a link to reset your password.',
                        style: TextStyle(
                          fontSize: 16,
                          color: kTextSecondary,
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ],
                  ),
                ),
                
                const SizedBox(height: 32),
                
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
                        TextFormField(
                          controller: _emailController,
                          keyboardType: TextInputType.emailAddress,
                          decoration: const InputDecoration(
                            labelText: 'Email Address',
                            hintText: 'Enter your email address',
                            prefixIcon: Icon(Icons.email_outlined),
                            border: OutlineInputBorder(),
                          ),
                          validator: (value) {
                            if (value == null || value.trim().isEmpty) {
                              return 'Please enter your email address';
                            }
                            if (!RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$').hasMatch(value.trim())) {
                              return 'Please enter a valid email address';
                            }
                            return null;
                          },
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
                          onPressed: _isLoading ? null : _submitForgotPassword,
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
                                  'Send Reset Link',
                                  style: TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                        ),
                        
                        const SizedBox(height: 16),
                        
                        // Back to Login Link
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
                            style: TextStyle(
                              color: kPrimaryColor,
                              fontSize: 16,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                
                const SizedBox(height: 24),
                
                // Help Text
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: kAccentColor.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: kAccentColor.withOpacity(0.3),
                    ),
                  ),
                  child: Row(
                    children: [
                      Icon(
                        Icons.info_outline,
                        color: kAccentColor,
                        size: 20,
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          'Check your email inbox and spam folder for the reset link. The link will expire in 24 hours.',
                          style: TextStyle(
                            color: kAccentColor,
                            fontSize: 14,
                          ),
                        ),
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
} 