import 'dart:async';
import 'dart:math';

class ChatMessage {
  final String id;
  final String role; // 'user' or 'assistant'
  String content; // Made mutable for translation
  final DateTime timestamp;
  final String? context;
  bool isTranslating;
  bool isTranslated;

  ChatMessage({
    required this.id,
    required this.role,
    required this.content,
    required this.timestamp,
    this.context,
    this.isTranslating = false,
    this.isTranslated = false,
  });
}

class CVEnhancementRequest {
  final String currentCV;
  final String targetIndustry;
  final String experienceLevel;
  final List<String> skills;

  CVEnhancementRequest({
    required this.currentCV,
    required this.targetIndustry,
    required this.experienceLevel,
    required this.skills,
  });
}

class AnnouncementGenerationRequest {
  final String urgency; // 'low', 'medium', 'high'
  final String language; // 'en', 'sw'
  final String targetAudience;
  final List<String> keyPoints;

  AnnouncementGenerationRequest({
    required this.urgency,
    required this.language,
    required this.targetAudience,
    required this.keyPoints,
  });
}

class AIChatService {
  static final AIChatService _instance = AIChatService._internal();
  factory AIChatService() => _instance;
  AIChatService._internal();

  final StreamController<List<ChatMessage>> _chatHistoryController = 
      StreamController<List<ChatMessage>>.broadcast();
  
  Stream<List<ChatMessage>> get chatHistory$ => _chatHistoryController.stream;
  
  final List<ChatMessage> _chatHistory = [];

  // Mock responses for different scenarios
  final Map<String, String> _mockChatResponses = {
    'letter': '''Karibu! Mimi ni msaidizi wa SUZA. Kuna njia kadhaa za kuomba barua:

1. Barua ya Utangulizi (Introduction Letter)
   - Enda kwenye ofisi ya mkuu wa chuo
   - Jaza fomu ya maombi
   - Subiri siku 3-5 kwa majibu

2. Barua ya Uchambuzi (Analysis Letter)
   - Wasiliana na mwalimu wako
   - Jaza fomu ya uchambuzi
   - Subiri siku 2-3

3. Barua ya Utoaji (Discontinuation Letter)
   - Enda kwenye ofisi ya masomo
   - Jaza fomu maalum
   - Subiri siku 5-7

Una swali lolote lingine?''',
    
    'exam': '''Mikutano ya mitihani ya SUZA:

Mitihani ya Kati (Mid-semester):
- Wiki ya 8-9 ya muhula
- Ratiba itatangazwa wiki 2 mapema

Mitihani ya Mwisho (Final Exams):
- Wiki ya 15-16 ya muhula
- Ratiba itatangazwa wiki 4 mapema

Mitihani ya Marudio (Supplementary):
- Baada ya matokeo ya mitihani ya mwisho
- Tu kwa masomo uliyoshindwa

Kumbuka: Daima angalia matangazo rasmi kwenye portal!''',
    
    'password': '''Kuna njia 3 za kurejesha neno la siri:

1. Kupitia Portal:
   - Bofya "Forgot Password"
   - Weka email yako
   - Fuata maagizo kwenye email

2. Kupitia Ofisi ya IT:
   - Enda kwenye ofisi ya IT
   - Jaza fomu ya maelezo
   - Subiri siku 1-2

3. Kupitia Mwalimu:
   - Wasiliana na mwalimu wako
   - Jaza fomu ya msaada
   - Subiri siku 2-3

Kwa msaada wa haraka, piga: +255 24 223 3000''',
    
    'library': '''Maktaba ya SUZA iko:

Mahali: Jengo la Maktaba, Chuo Kikuu cha SUZA
Saa za Kazi:
- Jumatatu - Ijumaa: 8:00 AM - 10:00 PM
- Jumamosi: 9:00 AM - 6:00 PM
- Jumapili: 10:00 AM - 4:00 PM

Huduma:
- Kukodi vitabu (siku 14)
- Kujifunza kwenye majumba ya kusoma
- Huduma za kompyuta
- Msaada wa utafiti

Mawasiliano: +255 24 223 3001''',
    
    'lecturer': '''Kuna njia kadhaa za kuwasiliana na walimu:

1. Kupitia Email:
   - Tafuta email ya mwalimu kwenye portal
   - Tumia email rasmi ya SUZA

2. Kupitia Ofisi:
   - Angalia saa za ofisi kwenye portal
   - Enda kwenye ofisi yao

3. Kupitia Mikutano:
   - Jumuika na mikutano ya darasa
   - Tumia saa za msaada

4. Kupitia Portal:
   - Tumia huduma ya ujumbe kwenye portal
   - Subiri majibu kwenye saa 24

Kumbuka: Daima tumia lugha ya heshima!''',
    
    'graduation': '''Mahitaji ya kuhitimu SUZA:

Mahitaji ya Msingi:
- Kukamilisha masomo yote (180 credit hours)
- GPA ya chini ya 2.0
- Malipo yote yamelipwa

Mahitaji ya Ziada:
- Kukamilisha mradi wa mwisho
- Kufanya kazi ya uwanja (kama inahitajika)
- Kukamilisha masomo ya lazima

Mchakato:
1. Jaza fomu ya maelezo
2. Subiri uthibitisho
3. Chagua jina la mradi
4. Fanya mradi
5. Subiri matokeo

Kwa maelezo zaidi, enda kwenye ofisi ya masomo.''',
    
    'default': '''Karibu kwenye Msaidizi wa SUZA! 🎓

Mimi ni msaidizi wako wa AI ninaweza kukusaidia na:

📚 Masomo na Mitihani
📝 Maombi ya Barua
🔐 Masuala ya Portal
📖 Maktaba na Rasilimali
👨‍🏫 Mawasiliano na Walimu
🎓 Mahitaji ya Kuhitimu

Una swali lolote? Unaweza kuuliza kwa Kiswahili au Kiingereza!''',
  };

  // Mock CV enhancement suggestions
  final Map<String, String> _mockCVEnhancements = {
    'technology': '''Mapendekezo ya Kuboresha CV yako:

1. Muhtasari wa Kitaaluma (Professional Summary)
   - Ongeza muhtasari mfupi wa uzoefu wako
   - Eleza lengo lako la kazi

2. Uzoefu wa Kazi
   - Tumia maneno ya vitendo (action verbs)
   - Ongeza matokeo ya namba
   - Eleza jukumu lako kwa undani

3. Ujuzi wa Kiufundi
   - Pangilia kwa kategoria
   - Ongeza viwango vya ujuzi
   - Jumuisha teknolojia mpya

4. Mafunzo
   - Ongeza GPA ikiwa ni juu ya 3.0
   - Eleza mradi wa mwisho
   - Ongeza shahada za ziada

5. Michezo ya Jumuiya
   - Ongeza shughuli za jumuiya
   - Eleza uongozi na ushiriki

Maneno ya Kuboresha:
- "Developed" badala ya "Made"
- "Implemented" badala ya "Did"
- "Managed" badala ya "Handled"

Vidokezo vya ATS:
- Tumia maneno muhimu kutoka kwenye maelezo ya kazi
- Hakikisha fonti ni rahisi kusoma
- Epuka picha na muundo tata''',

    'general': '''Mapendekezo ya Jumla ya CV:

1. Muhtasari wa Kitaaluma
   - Eleza uzoefu wako kwa ufupi
   - Ongeza lengo lako la kazi

2. Uzoefu wa Kazi
   - Tumia maneno ya vitendo
   - Ongeza matokeo halisi
   - Eleza jukumu lako

3. Ujuzi
   - Pangilia kwa kategoria
   - Ongeza viwango vya ujuzi

4. Mafunzo
   - Ongeza GPA ikiwa ni juu
   - Eleza mradi wa mwisho

5. Michezo ya Jumuiya
   - Ongeza shughuli za jumuiya
   - Eleza uongozi''',
  };

  // Mock announcement templates
  final Map<String, Map<String, String>> _mockAnnouncements = {
    'low': {
      'en': '''ANNOUNCEMENT

Dear Students,

This is to inform you about the following updates:

{KEY_POINTS}

Please take note of these changes and ensure compliance.

For any questions, please contact the relevant department.

Best regards,
SUZA Administration''',
      'sw': '''TANGAZO

Wanafunzi waheshimiwa,

Hili ni tangazo kuhusu mabadiliko yafuatayo:

{KEY_POINTS}

Tafadhali fahamishwa na mabadiliko haya na hakikisha utekelezaji.

Kwa maswali yoyote, tafadhali wasiliana na idara husika.

Kwa heshima,
Utawala wa SUZA''',
    },
    'medium': {
      'en': '''IMPORTANT ANNOUNCEMENT

Dear {AUDIENCE},

Please be advised of the following important information:

{KEY_POINTS}

Action Required: Please review and take necessary action as indicated above.

Deadline: Please complete required actions by the specified date.

For immediate assistance, contact: +255 24 223 3000

Best regards,
SUZA Administration''',
      'sw': '''TANGAZO MUHIMU

{AUDIENCE} waheshimiwa,

Tafadhali fahamishwa na taarifa muhimu zifuatazo:

{KEY_POINTS}

Kitendo Kinachohitajika: Tafadhali angalia na fanya kitendo kinachohitajika kama kimeonyeshwa hapo juu.

Muda: Tafadhali kamilisha vitendo vinavyohitajika kufikia tarehe iliyobainishwa.

Kwa msaada wa haraka, wasiliana: +255 24 223 3000

Kwa heshima,
Utawala wa SUZA''',
    },
    'high': {
      'en': '''URGENT ANNOUNCEMENT

ATTENTION: {AUDIENCE}

This is an URGENT notification requiring immediate attention:

{KEY_POINTS}

IMMEDIATE ACTION REQUIRED
Please take action NOW. This matter cannot be delayed.

Emergency Contact: +255 24 223 3000

This announcement supersedes all previous communications on this matter.

Best regards,
SUZA Emergency Response Team''',
      'sw': '''TANGAZO LA DHARURA

MAKINI: {AUDIENCE}

Hili ni tangazo la DHARURA linalohitaji tahadhari ya haraka:

{KEY_POINTS}

KITENDO CHA HARAKA KINACHOHITAJIKA
Tafadhali fanya kitendo SASA. Jambo hili haliwezi kuchelewa.

Mawasiliano ya Dharura: +255 24 223 3000

Tangazo hili linachukua nafasi ya mawasiliano yote ya awali kuhusu jambo hili.

Kwa heshima,
Timu ya Dharura ya SUZA''',
    }
  };

  // Chat with AI (Mock)
  Future<String> chatWithAI(String message, {String? context}) async {
    final lowerMessage = message.toLowerCase();
    
    // Determine response based on message content
    String response = _mockChatResponses['default']!;
    
    if (lowerMessage.contains('barua') || lowerMessage.contains('letter') || lowerMessage.contains('apply')) {
      response = _mockChatResponses['letter']!;
    } else if (lowerMessage.contains('mitihani') || lowerMessage.contains('exam') || lowerMessage.contains('test')) {
      response = _mockChatResponses['exam']!;
    } else if (lowerMessage.contains('neno la siri') || lowerMessage.contains('password') || lowerMessage.contains('reset')) {
      response = _mockChatResponses['password']!;
    } else if (lowerMessage.contains('maktaba') || lowerMessage.contains('library')) {
      response = _mockChatResponses['library']!;
    } else if (lowerMessage.contains('mwalimu') || lowerMessage.contains('lecturer') || lowerMessage.contains('teacher')) {
      response = _mockChatResponses['lecturer']!;
    } else if (lowerMessage.contains('hitimu') || lowerMessage.contains('graduation') || lowerMessage.contains('graduate')) {
      response = _mockChatResponses['graduation']!;
    }

    // Simulate API delay
    await Future.delayed(Duration(milliseconds: 1000 + Random().nextInt(2000)));
    return response;
  }

  // Enhance CV (Mock)
  Future<String> enhanceCV(CVEnhancementRequest request) async {
    final industry = request.targetIndustry.toLowerCase();
    String response = _mockCVEnhancements['general']!;
    
    if (industry.contains('tech') || industry.contains('technology') || industry.contains('software')) {
      response = _mockCVEnhancements['technology']!;
    }

    await Future.delayed(Duration(milliseconds: 2000 + Random().nextInt(3000)));
    return response;
  }

  // Generate announcement (Mock)
  Future<String> generateAnnouncement(AnnouncementGenerationRequest request) async {
    final urgency = request.urgency;
    final language = request.language;
    final audience = request.targetAudience;
    final keyPoints = request.keyPoints.join('\n• ');
    
    String template = _mockAnnouncements[urgency]![language]!;
    template = template.replaceAll('{AUDIENCE}', audience);
    template = template.replaceAll('{KEY_POINTS}', '• $keyPoints');
    
    await Future.delayed(Duration(milliseconds: 1500 + Random().nextInt(2000)));
    return template;
  }

  // Analyze student data (Mock)
  Future<String> analyzeStudentData(String query) async {
    final response = '''Uchambuzi wa Data ya Wanafunzi

Kulingana na swali lako: "$query"

Matokeo ya Uchambuzi:
• Jumla ya wanafunzi: 15,234
• Wanafunzi waliohitimu: 12,456 (81.8%)
• GPA ya wastani: 3.2
• Idadi kubwa: Computer Science (2,345)

Mapendekezo:
1. Ongeza msaada wa masomo kwa wanafunzi wa GPA ya chini
2. Boresha rasilimali za maktaba
3. Ongeza mafunzo ya ziada

Vipimo vya Mafanikio:
• Kiwango cha kuhitimu: 81.8%
• Uridhishaji wa wanafunzi: 4.2/5.0
• Kiwango cha kurudi: 92.3%''';
    
    await Future.delayed(Duration(milliseconds: 2500 + Random().nextInt(2000)));
    return response;
  }

  // Process document (Mock)
  Future<String> processDocument(String documentContent, String documentType) async {
    final response = '''Uchambuzi wa $documentType

Taarifa Muhimu:
• Aina ya hati: $documentType
• Urefu: ${documentContent.length} herufi
• Idadi ya aya: ${documentContent.split('\n').length}

Mapendekezo:
1. Hakikisha muhtasari wa wazi
2. Ongeza maelezo ya mawasiliano
3. Boresha muundo wa hati

Masuala yaliyogunduliwa:
• Hakuna maelezo ya mawasiliano
• Muhtasari hauna wazi
• Hati inahitaji muundo bora

Mapendekezo ya Kuboresha:
• Ongeza muhtasari wa wazi
• Jumuisha maelezo ya mawasiliano
• Boresha muundo wa hati''';
    
    await Future.delayed(Duration(milliseconds: 1800 + Random().nextInt(2000)));
    return response;
  }

  // Health check (Mock)
  Future<bool> checkServiceHealth() async {
    await Future.delayed(Duration(milliseconds: 500));
    return true;
  }

  // Get available models (Mock)
  Future<List<String>> getAvailableModels() async {
    await Future.delayed(Duration(milliseconds: 300));
    return ['pawa-min-alpha', 'pawa-min-beta', 'pawa-min-pro', 'pawa-min-ultimate'];
  }

  // Test connection (Mock)
  Future<bool> testConnection() async {
    await Future.delayed(Duration(milliseconds: 800));
    return true;
  }

  // Translate to English (Mock)
  Future<String> translateToEnglish(String content) async {
    // Mock English translations for Swahili content
    final Map<String, String> translations = {
      'karibu': 'Welcome',
      'msaidizi': 'Assistant',
      'barua': 'Letter',
      'mitihani': 'Exams',
      'maktaba': 'Library',
      'mwalimu': 'Lecturer',
      'hitimu': 'Graduate',
      'neno la siri': 'Password',
      'masomo': 'Studies',
      'chuo': 'University',
      'wanafunzi': 'Students',
      'ofisi': 'Office',
      'fomu': 'Form',
      'subiri': 'Wait',
      'majibu': 'Response',
      'mawasiliano': 'Contact',
      'email': 'Email',
      'piga': 'Call',
      'enda': 'Go',
      'jaza': 'Fill',
      'wasiliana': 'Contact',
      'angalia': 'Check',
      'kumbuka': 'Remember',
      'daima': 'Always',
      'portal': 'Portal',
      'rasmi': 'Official',
      'tangazo': 'Announcement',
      'muhimu': 'Important',
      'dharura': 'Emergency',
      'kitendo': 'Action',
      'kinachohitajika': 'Required',
      'muda': 'Time',
      'tarehe': 'Date',
      'msaada': 'Help',
      'haraka': 'Quick',
      'taarifa': 'Information',
      'mabadiliko': 'Changes',
      'utekelezaji': 'Implementation',
      'maswali': 'Questions',
      'idara': 'Department',
      'heshima': 'Respect',
      'utawala': 'Administration',
      'timu': 'Team',
      'mawasiliano ya dharura': 'Emergency Contact'
    };

    // Simple translation logic - replace Swahili words with English
    String translatedContent = content;
    
    // Replace common Swahili words
    translations.forEach((swahili, english) {
      final regex = RegExp(swahili, caseSensitive: false);
      translatedContent = translatedContent.replaceAll(regex, english);
    });

    // Add some context-specific translations
    if (content.contains('Karibu kwenye Msaidizi wa SUZA')) {
      translatedContent = '''Welcome to SUZA Assistant! 🎓

I am your AI assistant and I can help you with:

📚 Studies and Exams
📝 Letter Applications
🔐 Portal Issues
📖 Library and Resources
👨‍🏫 Lecturer Communication
🎓 Graduation Requirements

Do you have any questions? You can ask in Swahili or English!''';
    }

    if (content.contains('Kuna njia kadhaa za kuomba barua')) {
      translatedContent = '''Welcome! I am the SUZA assistant. There are several ways to apply for a letter:

1. Introduction Letter
   - Go to the university office
   - Fill out the application form
   - Wait 3-5 days for response

2. Analysis Letter
   - Contact your lecturer
   - Fill out the analysis form
   - Wait 2-3 days

3. Discontinuation Letter
   - Go to the studies office
   - Fill out special form
   - Wait 5-7 days

Do you have any other questions?''';
    }

    if (content.contains('Mikutano ya mitihani ya SUZA')) {
      translatedContent = '''SUZA Exam Schedule:

Mid-semester Exams:
- Week 8-9 of semester
- Schedule will be announced 2 weeks in advance

Final Exams:
- Week 15-16 of semester
- Schedule will be announced 4 weeks in advance

Supplementary Exams:
- After final exam results
- Only for failed subjects

Remember: Always check official announcements on the portal!''';
    }

    if (content.contains('Kuna njia 3 za kurejesha neno la siri')) {
      translatedContent = '''There are 3 ways to reset your password:

1. Through Portal:
   - Click "Forgot Password"
   - Enter your email
   - Follow instructions in email

2. Through IT Office:
   - Go to IT office
   - Fill out information form
   - Wait 1-2 days

3. Through Lecturer:
   - Contact your lecturer
   - Fill out help form
   - Wait 2-3 days

For quick help, call: +255 24 223 3000''';
    }

    if (content.contains('Maktaba ya SUZA iko')) {
      translatedContent = '''SUZA Library is located:

Location: Library Building, SUZA University
Working Hours:
- Monday - Friday: 8:00 AM - 10:00 PM
- Saturday: 9:00 AM - 6:00 PM
- Sunday: 10:00 AM - 4:00 PM

Services:
- Book borrowing (14 days)
- Study rooms
- Computer services
- Research assistance

Contact: +255 24 223 3001''';
    }

    if (content.contains('Kuna njia kadhaa za kuwasiliana na walimu')) {
      translatedContent = '''There are several ways to contact lecturers:

1. Through Email:
   - Find lecturer's email on portal
   - Use official SUZA email

2. Through Office:
   - Check office hours on portal
   - Go to their office

3. Through Meetings:
   - Join class meetings
   - Use consultation hours

4. Through Portal:
   - Use messaging service on portal
   - Wait for response within 24 hours

Remember: Always use respectful language!''';
    }

    if (content.contains('Mahitaji ya kuhitimu SUZA')) {
      translatedContent = '''SUZA Graduation Requirements:

Basic Requirements:
- Complete all courses (180 credit hours)
- Minimum GPA of 2.0
- All payments completed

Additional Requirements:
- Complete final project
- Field work (if required)
- Complete required courses

Process:
1. Fill out information form
2. Wait for confirmation
3. Choose project title
4. Complete project
5. Wait for results

For more information, go to the studies office.''';
    }

    // Simulate API delay
    await Future.delayed(Duration(milliseconds: 1500 + Random().nextInt(1000)));
    return translatedContent;
  }

  // Add message to chat history
  void addToChatHistory(ChatMessage message) {
    _chatHistory.add(message);
    _chatHistoryController.add(List.from(_chatHistory));
  }

  // Clear chat history
  void clearChatHistory() {
    _chatHistory.clear();
    _chatHistoryController.add([]);
  }

  // Get current chat history
  List<ChatMessage> getChatHistory() {
    return List.from(_chatHistory);
  }

  // Dispose
  void dispose() {
    _chatHistoryController.close();
  }
} 