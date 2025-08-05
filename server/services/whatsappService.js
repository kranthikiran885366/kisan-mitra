class WhatsAppService {
  constructor() {
    this.isEnabled = false;
    
    // Only initialize Twilio if credentials are provided
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      try {
        const twilio = require("twilio");
        this.client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
        this.whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER || "whatsapp:+14155238886";
        this.isEnabled = true;
      } catch (error) {
        console.warn("⚠️  Twilio initialization failed:", error.message);
      }
    } else {
      console.warn("⚠️  WhatsApp service is disabled. TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN are required.");
    }
  }

  // Send OTP via WhatsApp
  async sendOTP(mobile, otp, language = "en") {
    if (!this.isEnabled) {
      console.warn("⚠️  WhatsApp service is disabled. Cannot send OTP.");
      return { success: false, message: "WhatsApp service is disabled" };
    }

    try {
      const messages = {
        en: `🌾 Kisan Mitra Verification\n\nYour OTP is: ${otp}\n\nThis code will expire in 10 minutes.\n\nDo not share this code with anyone.`,
        hi: `🌾 किसान मित्र सत्यापन\n\nआपका OTP है: ${otp}\n\nयह कोड 10 मिनट में समाप्त हो जाएगा।\n\nइस कोड को किसी के साथ साझा न करें।`,
        te: `🌾 కిసాన్ మిత్ర వెరిఫికేషన్\n\nమీ OTP: ${otp}\n\nఈ కోడ్ 10 నిమిషాలలో గడువు ముగుస్తుంది।\n\nఈ కోడ్‌ను ఎవరితోనూ పంచుకోవద్దు।`,
      };

      const message = messages[language] || messages.en;

      // In development or if Twilio is not configured, just log the message
      if (process.env.NODE_ENV === "development" || !this.client) {
        console.log(`[WhatsApp OTP to ${mobile}]: ${message}`);
        return { success: true, messageId: "simulated" };
      }

      const result = await this.client.messages.create({
        from: this.whatsappNumber,
        to: `whatsapp:+91${mobile}`,
        body: message,
      });

      return { success: true, messageId: result.sid };
    } catch (error) {
      console.error("WhatsApp OTP send error:", error);
      return { success: false, message: "Failed to send WhatsApp OTP" };
    }
  }

  // Send weather alert via WhatsApp
  async sendWeatherAlert(mobile, alertContent, language = "en") {
    try {
      const message = `🌤️ ${alertContent.title}\n\n${alertContent.message}\n\n📱 Open Kisan Mitra app for detailed forecast and farming advice.`

      if (process.env.NODE_ENV === "development") {
        console.log(`WhatsApp Weather Alert to ${mobile}: ${message}`)
        return { success: true, messageId: "dev-mode" }
      }

      const result = await this.client.messages.create({
        from: this.whatsappNumber,
        to: `whatsapp:+91${mobile}`,
        body: message,
      })

      return { success: true, messageId: result.sid }
    } catch (error) {
      console.error("WhatsApp weather alert send error:", error)
      throw new Error("Failed to send WhatsApp weather alert")
    }
  }

  // Send scheme notification via WhatsApp
  async sendSchemeNotification(mobile, scheme, language = "en") {
    try {
      const content = scheme.getLocalizedContent(language)

      const message = `📢 New Government Scheme Alert!\n\n🎯 ${content.name}\n\n📝 ${content.description.substring(0, 200)}...\n\n💰 Benefit: ₹${scheme.financialDetails.maxBenefitAmount || "Variable"}\n\n📅 Apply before: ${scheme.timeline.applicationEndDate ? new Date(scheme.timeline.applicationEndDate).toLocaleDateString() : "Check app"}\n\n📱 Open Kisan Mitra app to apply now!`

      if (process.env.NODE_ENV === "development") {
        console.log(`WhatsApp Scheme Alert to ${mobile}: ${message}`)
        return { success: true, messageId: "dev-mode" }
      }

      const result = await this.client.messages.create({
        from: this.whatsappNumber,
        to: `whatsapp:+91${mobile}`,
        body: message,
      })

      return { success: true, messageId: result.sid }
    } catch (error) {
      console.error("WhatsApp scheme notification send error:", error)
      throw new Error("Failed to send WhatsApp scheme notification")
    }
  }

  // Send market price alert via WhatsApp
  async sendMarketPriceAlert(mobile, priceData, language = "en") {
    try {
      const messages = {
        en: `📈 Market Price Alert!\n\n🌾 ${priceData.crop}\n💰 Current Price: ₹${priceData.price}/quintal\n📊 Change: ${priceData.change > 0 ? "+" : ""}${priceData.change}%\n📍 Market: ${priceData.market}\n\n📱 Check Kisan Mitra app for more markets and trends!`,
        hi: `📈 बाजार मूल्य अलर्ट!\n\n🌾 ${priceData.crop}\n💰 वर्तमान मूल्य: ₹${priceData.price}/क्विंटल\n📊 परिवर्तन: ${priceData.change > 0 ? "+" : ""}${priceData.change}%\n📍 बाजार: ${priceData.market}\n\n📱 अधिक बाजारों और रुझानों के लिए किसान मित्र ऐप देखें!`,
        te: `📈 మార్కెట్ ధర హెచ్చరిక!\n\n🌾 ${priceData.crop}\n💰 ప్రస్తుత ధర: ₹${priceData.price}/క్వింటల్\n📊 మార్పు: ${priceData.change > 0 ? "+" : ""}${priceData.change}%\n📍 మార్కెట్: ${priceData.market}\n\n📱 మరిన్ని మార్కెట్లు మరియు ట్రెండ్‌ల కోసం కిసాన్ మిత్ర యాప్ చూడండి!`,
      }

      const message = messages[language] || messages.en

      if (process.env.NODE_ENV === "development") {
        console.log(`WhatsApp Market Alert to ${mobile}: ${message}`)
        return { success: true, messageId: "dev-mode" }
      }

      const result = await this.client.messages.create({
        from: this.whatsappNumber,
        to: `whatsapp:+91${mobile}`,
        body: message,
      })

      return { success: true, messageId: result.sid }
    } catch (error) {
      console.error("WhatsApp market alert send error:", error)
      throw new Error("Failed to send WhatsApp market alert")
    }
  }

  // Send crop advice via WhatsApp
  async sendCropAdvice(mobile, advice, language = "en") {
    try {
      const messages = {
        en: `🌱 Crop Advisory\n\n${advice.title}\n\n📋 ${advice.description}\n\n⏰ Action needed: ${advice.timing}\n\n📱 Get detailed guidance in Kisan Mitra app!`,
        hi: `🌱 फसल सलाह\n\n${advice.title}\n\n📋 ${advice.description}\n\n⏰ कार्रवाई आवश्यक: ${advice.timing}\n\n📱 किसान मित्र ऐप में विस्तृत मार्गदर्शन प्राप्त करें!`,
        te: `🌱 పంట సలహా\n\n${advice.title}\n\n📋 ${advice.description}\n\n⏰ చర్య అవసరం: ${advice.timing}\n\n📱 కిసాన్ మిత్ర యాప్‌లో వివరణాత్మక మార్గదర్శకత్వం పొందండి!`,
      }

      const message = messages[language] || messages.en

      if (process.env.NODE_ENV === "development") {
        console.log(`WhatsApp Crop Advice to ${mobile}: ${message}`)
        return { success: true, messageId: "dev-mode" }
      }

      const result = await this.client.messages.create({
        from: this.whatsappNumber,
        to: `whatsapp:+91${mobile}`,
        body: message,
      })

      return { success: true, messageId: result.sid }
    } catch (error) {
      console.error("WhatsApp crop advice send error:", error)
      throw new Error("Failed to send WhatsApp crop advice")
    }
  }

  // Send community group invite via WhatsApp
  async sendGroupInvite(mobile, groupData, language = "en") {
    try {
      const messages = {
        en: `👥 Join Farming Community!\n\n🌾 Group: ${groupData.name}\n📍 Location: ${groupData.location}\n👨‍🌾 Members: ${groupData.memberCount}\n\n${groupData.description}\n\n🔗 Join: ${groupData.whatsappLink}\n\n📱 Manage groups in Kisan Mitra app!`,
        hi: `👥 कृषि समुदाय में शामिल हों!\n\n🌾 समूह: ${groupData.name}\n📍 स्थान: ${groupData.location}\n👨‍🌾 सदस्य: ${groupData.memberCount}\n\n${groupData.description}\n\n🔗 शामिल हों: ${groupData.whatsappLink}\n\n📱 किसान मित्र ऐप में समूहों का प्रबंधन करें!`,
        te: `👥 వ్యవసాయ కమ్యూనిటీలో చేరండి!\n\n🌾 గ్రూప్: ${groupData.name}\n📍 స్థానం: ${groupData.location}\n👨‍🌾 సభ్యులు: ${groupData.memberCount}\n\n${groupData.description}\n\n🔗 చేరండి: ${groupData.whatsappLink}\n\n📱 కిసాన్ మిత్ర యాప్‌లో గ్రూపులను నిర్వహించండి!`,
      }

      const message = messages[language] || messages.en

      if (process.env.NODE_ENV === "development") {
        console.log(`WhatsApp Group Invite to ${mobile}: ${message}`)
        return { success: true, messageId: "dev-mode" }
      }

      const result = await this.client.messages.create({
        from: this.whatsappNumber,
        to: `whatsapp:+91${mobile}`,
        body: message,
      })

      return { success: true, messageId: result.sid }
    } catch (error) {
      console.error("WhatsApp group invite send error:", error)
      throw new Error("Failed to send WhatsApp group invite")
    }
  }

  // Send bulk message to multiple users
  async sendBulkMessage(recipients, message, language = "en") {
    try {
      const results = []

      for (const recipient of recipients) {
        try {
          const result = await this.client.messages.create({
            from: this.whatsappNumber,
            to: `whatsapp:+91${recipient.mobile}`,
            body: message,
          })

          results.push({
            mobile: recipient.mobile,
            success: true,
            messageId: result.sid,
          })
        } catch (error) {
          results.push({
            mobile: recipient.mobile,
            success: false,
            error: error.message,
          })
        }

        // Add delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }

      return results
    } catch (error) {
      console.error("WhatsApp bulk message send error:", error)
      throw new Error("Failed to send WhatsApp bulk messages")
    }
  }

  // Get message status
  async getMessageStatus(messageId) {
    try {
      const message = await this.client.messages(messageId).fetch()
      return {
        status: message.status,
        errorCode: message.errorCode,
        errorMessage: message.errorMessage,
        dateCreated: message.dateCreated,
        dateSent: message.dateSent,
        dateUpdated: message.dateUpdated,
      }
    } catch (error) {
      console.error("WhatsApp message status error:", error)
      throw new Error("Failed to get WhatsApp message status")
    }
  }

  // Validate WhatsApp number
  validateWhatsAppNumber(mobile) {
    const phoneRegex = /^[6-9]\d{9}$/
    return phoneRegex.test(mobile)
  }

  // Format mobile number for WhatsApp
  formatMobileNumber(mobile) {
    // Remove any non-digit characters
    const cleaned = mobile.replace(/\D/g, "")

    // Add country code if not present
    if (cleaned.length === 10 && cleaned.match(/^[6-9]/)) {
      return `+91${cleaned}`
    }

    if (cleaned.length === 12 && cleaned.startsWith("91")) {
      return `+${cleaned}`
    }

    return mobile
  }
}

module.exports = new WhatsAppService()
