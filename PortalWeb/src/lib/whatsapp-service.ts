// WhatsApp notification service using Twilio WhatsApp Business API (DISABLED)
/*
import twilio from "twilio"

interface OrderDetails {
  orderId: string
  customerName: string
  customerPhone: string
  products: Array<{
    title: string
    quantity: number
    price: number
  }>
  totalAmount: number
  paymentMethod: string
  status: string
  createdAt: string
}

interface MarketingMessageDetails {
  phone: string
  name: string
  message: string
  campaignType?: "product_launch" | "offer" | "update" | "general"
  productLink?: string
  offerCode?: string
}

export class WhatsAppService {
  private client: twilio.Twilio
  private fromNumber: string
  private smsFromNumber: string
  private isSMSConfigured: boolean

  constructor() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN
    this.fromNumber = process.env.TWILIO_WHATSAPP_FROM || "whatsapp:+14155238886" // Twilio Sandbox number
    this.smsFromNumber = process.env.TWILIO_SMS_FROM || "+12345678900" // SMS phone number

    this.isSMSConfigured = this.validateSMSConfiguration()

    if (!accountSid || !authToken) {
      throw new Error("Twilio credentials are required for WhatsApp service")
    }

    this.client = twilio(accountSid, authToken)
  }

  private validateSMSConfiguration(): boolean {
    // Check if SMS number is properly configured (not placeholder)
    const isPlaceholder =
      this.smsFromNumber === "+12345678900" ||
      this.smsFromNumber.includes("12345678900") ||
      !this.smsFromNumber.startsWith("+")

    if (isPlaceholder) {
      console.warn("[SMS Config] SMS fallback disabled - TWILIO_SMS_FROM not configured properly")
      console.warn("[SMS Config] Current value:", this.smsFromNumber)
      console.warn("[SMS Config] Please set a valid Twilio phone number in TWILIO_SMS_FROM environment variable")
      return false
    }

    console.log("[SMS Config] SMS fallback enabled with number:", this.smsFromNumber)
    return true
  }

  // Format order details into WhatsApp message
  private formatOrderMessage(orderDetails: OrderDetails): string {
    const { orderId, customerName, products, totalAmount, paymentMethod, status, createdAt } = orderDetails

    let message = `🎉 *Order Confirmation*\n\n`
    message += `Hello ${customerName}! 👋\n\n`
    message += `Your order has been successfully placed!\n\n`
    message += `📋 *Order Details:*\n`
    message += `Order ID: #${orderId}\n`
    message += `Date: ${new Date(createdAt).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })}\n`
    message += `Status: ${status.toUpperCase()}\n\n`

    message += `🛍️ *Items Ordered:*\n`
    products.forEach((product, index) => {
      message += `${index + 1}. ${product.title}\n`
      message += `   Qty: ${product.quantity} × ₹${product.price.toFixed(2)}\n`
      message += `   Subtotal: ₹${(product.quantity * product.price).toFixed(2)}\n\n`
    })

    message += `💰 *Payment Summary:*\n`
    message += `Total Amount: ₹${totalAmount.toFixed(2)}\n`
    message += `Payment Method: ${paymentMethod === "COD" ? "Cash on Delivery" : "Online Payment"}\n\n`

    message += `📦 *What's Next?*\n`
    message += `• We'll process your order within 24 hours\n`
    message += `• You'll receive tracking details once shipped\n`
    message += `• Expected delivery: 3-5 business days\n\n`

    message += `Need help? Contact us:\n`
    message += `📞 Customer Support: +91-XXXXXXXXXX\n`
    message += `📧 Email: support@ind2b.com\n\n`

    message += `Thank you for shopping with IND2B! 🙏`

    return message
  }

  private formatMarketingMessage(messageDetails: MarketingMessageDetails): string {
    const { name, message, campaignType = "general", productLink, offerCode } = messageDetails

    let formattedMessage = `🌟 *Greetings from IND2B!* 🌟\n`
    formattedMessage += `🌐 Visit us: WWW.IND2B.COM\n\n`
    formattedMessage += `Hello ${name}! 👋\n\n`

    switch (campaignType) {
      case "product_launch":
        formattedMessage += `🚀 *EXCLUSIVE NEW PRODUCT LAUNCH!*\n`
        formattedMessage += `🎯 *Be the First to Experience Innovation*\n`
        formattedMessage += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`
        break
      case "offer":
        formattedMessage += `🔥 *LIMITED TIME SPECIAL OFFER!*\n`
        formattedMessage += `💰 *Massive Savings Await You*\n`
        formattedMessage += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`
        break
      case "update":
        formattedMessage += `📢 *IMPORTANT BUSINESS UPDATE*\n`
        formattedMessage += `🎯 *Stay Ahead with Latest Information*\n`
        formattedMessage += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`
        break
      default:
        formattedMessage += `💼 *EXCLUSIVE MESSAGE FROM IND2B*\n`
        formattedMessage += `🎯 *Your Success is Our Priority*\n`
        formattedMessage += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`
    }

    // Main campaign message
    formattedMessage += `${message}\n\n`

    // Add offer code if provided
    if (offerCode) {
      formattedMessage += `🎫 *EXCLUSIVE CODE:* ${offerCode}\n`
      formattedMessage += `💰 *Unlock Special Savings Now!*\n\n`
    }

    // Add product link if provided
    if (productLink) {
      formattedMessage += `🔗 *Shop Now:* ${productLink}\n`
      formattedMessage += `⚡ *Limited Stock - Act Fast!*\n\n`
    }

    formattedMessage += `🏆 *Why 10,000+ Businesses Choose IND2B?*\n`
    formattedMessage += `• 🚚 Lightning-Fast Delivery Nationwide\n`
    formattedMessage += `• 💯 100% Quality Guarantee\n`
    formattedMessage += `• 🛡️ Bank-Level Security & Trust\n`
    formattedMessage += `• 💰 Unbeatable Wholesale Prices\n`
    formattedMessage += `• 🎯 24/7 Dedicated Business Support\n`
    formattedMessage += `• 📈 Boost Your Business Growth\n\n`

    formattedMessage += `📞 *Get Instant Support:*\n`
    formattedMessage += `🌐 Website: WWW.IND2B.COM\n`
    formattedMessage += `📱 WhatsApp: +91-XXXXXXXXXX\n`
    formattedMessage += `📧 Email: support@ind2b.com\n`
    formattedMessage += `💬 Live Chat Available 24/7\n\n`

    formattedMessage += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`
    formattedMessage += `🏪 *IND2B - India's #1 B2B Platform*\n`
    formattedMessage += `🌐 WWW.IND2B.COM\n`
    formattedMessage += `"Empowering Businesses, Driving Success"\n\n`
    formattedMessage += `🚀 *Join 10,000+ Successful Businesses*\n`
    formattedMessage += `📱 Follow us for exclusive deals & updates!\n`
    formattedMessage += `Reply STOP to unsubscribe\n`
    formattedMessage += `━━━━━━━━━━━━━━━━━━━━━━━━━━`

    return formattedMessage
  }

  private formatSMSMarketingMessage(messageDetails: MarketingMessageDetails): string {
    const { name, message, campaignType = "general", productLink, offerCode } = messageDetails

    let smsMessage = `🌟 IND2B Marketing Alert!\n`
    smsMessage += `Hi ${name}!\n\n`

    switch (campaignType) {
      case "product_launch":
        smsMessage += `🚀 NEW PRODUCT LAUNCH!\n`
        break
      case "offer":
        smsMessage += `🔥 SPECIAL OFFER!\n`
        break
      case "update":
        smsMessage += `📢 IMPORTANT UPDATE!\n`
        break
      default:
        smsMessage += `💼 EXCLUSIVE MESSAGE!\n`
    }

    smsMessage += `\n${message}\n\n`

    if (offerCode) {
      smsMessage += `🎫 Code: ${offerCode}\n`
    }

    if (productLink) {
      smsMessage += `🔗 Shop: ${productLink}\n`
    }

    smsMessage += `\nVisit: WWW.IND2B.COM\n`
    smsMessage += `Support: +91-XXXXXXXXXX\n`
    smsMessage += `Reply STOP to unsubscribe`

    return smsMessage
  }

  async sendSMSFallback(messageDetails: MarketingMessageDetails): Promise<boolean> {
    if (!this.isSMSConfigured) {
      console.log(`[SMS Fallback] SMS not configured properly, skipping SMS fallback`)
      console.log(`[SMS Fallback] To enable SMS fallback, set TWILIO_SMS_FROM to a valid Twilio phone number`)
      return false
    }

    try {
      let phoneNumber = messageDetails.phone.replace(/\D/g, "")

      if (!phoneNumber.startsWith("91") && phoneNumber.length === 10) {
        phoneNumber = "91" + phoneNumber
      }

      const toNumber = `+${phoneNumber}`
      const smsMessage = this.formatSMSMarketingMessage(messageDetails)

      console.log(`[SMS Fallback] Sending SMS to ${toNumber}`)
      console.log(`[SMS Fallback] Message preview:`, smsMessage.substring(0, 100) + "...")

      const result = await this.client.messages.create({
        from: this.smsFromNumber,
        to: toNumber,
        body: smsMessage,
      })

      console.log(`[SMS Fallback] SMS sent successfully. SID: ${result.sid}`)
      return true
    } catch (error) {
      console.error("[SMS Fallback] Failed to send SMS:", error)
      if (error instanceof Error && error.message.includes("is not a Twilio phone number")) {
        console.error("[SMS Fallback] Invalid Twilio phone number. Please check TWILIO_SMS_FROM configuration")
        this.isSMSConfigured = false // Disable SMS for future attempts
      }
      return false
    }
  }

  async sendMarketingMessage(messageDetails: MarketingMessageDetails): Promise<boolean> {
    try {
      // First try WhatsApp
      const whatsappSuccess = await this.sendWhatsAppMessage(messageDetails)

      if (whatsappSuccess) {
        return true
      }

      console.log(`[Marketing] WhatsApp failed, checking SMS fallback availability...`)

      if (this.isSMSConfigured) {
        console.log(`[Marketing] Trying SMS fallback...`)
        const smsSuccess = await this.sendSMSFallback(messageDetails)

        if (smsSuccess) {
          console.log(`[Marketing] Message delivered via SMS fallback`)

          // Also send sandbox invitation for future WhatsApp messages
          if (this.isSandboxMode()) {
            await this.sendSandboxInvitation(messageDetails.phone, messageDetails.name)
          }

          return true
        }
      } else {
        console.log(`[Marketing] SMS fallback not available - TWILIO_SMS_FROM not configured`)
      }

      console.error(`[Marketing] All delivery methods failed for ${messageDetails.phone}`)

      if (!this.isSMSConfigured) {
        console.log(`[Marketing] To enable SMS fallback, configure TWILIO_SMS_FROM with a valid Twilio phone number`)
      }

      return false
    } catch (error) {
      console.error("[Marketing] Failed to send marketing message:", error)
      return false
    }
  }

  private async sendWhatsAppMessage(messageDetails: MarketingMessageDetails): Promise<boolean> {
    try {
      // Format phone number for WhatsApp (ensure it starts with country code)
      let phoneNumber = messageDetails.phone.replace(/\D/g, "") // Remove non-digits

      // Add country code if not present (assuming India +91)
      if (!phoneNumber.startsWith("91") && phoneNumber.length === 10) {
        phoneNumber = "91" + phoneNumber
      }

      const toNumber = `whatsapp:+${phoneNumber}`

      if (this.isSandboxMode()) {
        console.log(`[WhatsApp Marketing] SANDBOX MODE: Sending to ${toNumber}`)
        console.log(
          `[WhatsApp Marketing] Recipient must have sent "join ${this.getSandboxKeyword()}" to ${this.fromNumber}`,
        )
      }

      const formattedMessage = this.formatMarketingMessage(messageDetails)

      console.log(`[WhatsApp Marketing] Sending message to ${toNumber}`)
      console.log(`[WhatsApp Marketing] From number: ${this.fromNumber}`)
      console.log(`[WhatsApp Marketing] Message preview:`, formattedMessage.substring(0, 200) + "...")

      const result = await this.client.messages.create({
        from: this.fromNumber,
        to: toNumber,
        body: formattedMessage,
      })

      console.log(`[WhatsApp Marketing] Message sent successfully. SID: ${result.sid}`)

      // Check message status after a short delay
      return new Promise((resolve) => {
        setTimeout(async () => {
          try {
            const messageStatus = await this.client.messages(result.sid).fetch()
            console.log(`[WhatsApp Marketing] Message status for ${toNumber}: ${messageStatus.status}`)

            if (messageStatus.status === "failed") {
              const errorCode = messageStatus.errorCode
              const errorMessage = messageStatus.errorMessage || "Unknown error"

              console.log(`[WhatsApp Marketing] Message failed. Error Code: ${errorCode}`)
              console.log(`[WhatsApp Marketing] Error Message: ${errorMessage}`)

              if (this.isSandboxMode()) {
                console.log(`[WhatsApp Marketing] ❌ SANDBOX SETUP REQUIRED FOR ${toNumber}:`)
                console.log(
                  `[WhatsApp Marketing] 📱 Recipient must send "join ${this.getSandboxKeyword()}" to ${this.fromNumber}`,
                )
                console.log(`[WhatsApp Marketing] ��� Wait for confirmation before sending campaigns`)
              }
              resolve(false)
            } else if (messageStatus.status === "delivered" || messageStatus.status === "sent") {
              console.log(`[WhatsApp Marketing] ✅ Message delivered successfully to ${toNumber}`)
              resolve(true)
            } else {
              resolve(false)
            }
          } catch (statusError) {
            console.error(`[WhatsApp Marketing] Could not check message status:`, statusError)
            resolve(false)
          }
        }, 5000)
      })
    } catch (error) {
      console.error("[WhatsApp Marketing] Failed to send message:", error)
      return false
    }
  }

  // Automated sandbox invitation method
  async sendSandboxInvitation(phoneNumber: string, customerName: string): Promise<boolean> {
    if (!this.isSMSConfigured) {
      console.log(`[Sandbox Invitation] Cannot send invitation - SMS not configured`)
      return false
    }

    try {
      let formattedPhone = phoneNumber.replace(/\D/g, "")

      if (!formattedPhone.startsWith("91") && formattedPhone.length === 10) {
        formattedPhone = "91" + formattedPhone
      }

      const toNumber = `+${formattedPhone}`

      const invitationMessage =
        `🌟 Hi ${customerName}!\n\n` +
        `IND2B wants to send you exclusive WhatsApp updates!\n\n` +
        `📱 TO RECEIVE WHATSAPP MESSAGES:\n` +
        `1. Save this number: ${this.fromNumber.replace("whatsapp:", "")}\n` +
        `2. Send "join ${this.getSandboxKeyword()}" to that number\n` +
        `3. Wait for confirmation\n\n` +
        `✅ Once done, you'll get:\n` +
        `• Exclusive offers & deals\n` +
        `• New product launches\n` +
        `• Business updates\n\n` +
        `Visit: WWW.IND2B.COM\n` +
        `Reply STOP to unsubscribe`

      const result = await this.client.messages.create({
        from: this.smsFromNumber,
        to: toNumber,
        body: invitationMessage,
      })

      console.log(`[Sandbox Invitation] SMS invitation sent to ${toNumber}. SID: ${result.sid}`)
      return true
    } catch (error) {
      console.error("[Sandbox Invitation] Failed to send invitation:", error)
      return false
    }
  }

  // Send WhatsApp notification
  async sendOrderNotification(orderDetails: OrderDetails): Promise<boolean> {
    try {
      // Format phone number for WhatsApp (ensure it starts with country code)
      let phoneNumber = orderDetails.customerPhone.replace(/\D/g, "") // Remove non-digits

      // Add country code if not present (assuming India +91)
      if (!phoneNumber.startsWith("91") && phoneNumber.length === 10) {
        phoneNumber = "91" + phoneNumber
      }

      const toNumber = `whatsapp:+${phoneNumber}`
      const message = this.formatOrderMessage(orderDetails)

      console.log(`[WhatsApp] Sending notification to ${toNumber}`)
      console.log(`[WhatsApp] Message preview:`, message.substring(0, 200) + "...")

      const result = await this.client.messages.create({
        from: this.fromNumber,
        to: toNumber,
        body: message,
      })

      console.log(`[WhatsApp] Message sent successfully. SID: ${result.sid}`)
      return true
    } catch (error) {
      console.error("[WhatsApp] Failed to send notification:", error)

      // Log specific error details for debugging
      if (error instanceof Error) {
        console.error("[WhatsApp] Error message:", error.message)
      }

      return false
    }
  }

  // Test WhatsApp service connection
  async testConnection(): Promise<boolean> {
    try {
      // Send a simple test message to verify service is working
      const testMessage = await this.client.messages.create({
        from: this.fromNumber,
        to: "whatsapp:+919999999999", // Test number
        body: "WhatsApp service test - please ignore",
      })

      console.log(`[WhatsApp] Test message sent. SID: ${testMessage.sid}`)
      return true
    } catch (error) {
      console.error("[WhatsApp] Service test failed:", error)
      return false
    }
  }

  private getSandboxKeyword(): string {
    const sandboxKeyword = process.env.TWILIO_WHATSAPP_SANDBOX_KEYWORD || "arrow-plate"
    return sandboxKeyword
  }

  public isSandboxMode(): boolean {
    return this.fromNumber.includes("+14155238886") || this.fromNumber.includes("sandbox")
  }

  public getSandboxInstructions(): string {
    if (this.isSandboxMode()) {
      return `🔧 TWILIO WHATSAPP SANDBOX SETUP REQUIRED:

📱 STEP-BY-STEP INSTRUCTIONS:
1. Save ${this.fromNumber.replace("whatsapp:", "")} in your phone contacts
2. Open WhatsApp and send "join ${this.getSandboxKeyword()}" to this number
3. Wait for confirmation message from Twilio
4. Once confirmed, you can receive marketing messages

⚠️  IMPORTANT NOTES:
• Each recipient must complete this setup individually
• Sandbox is for testing only - limited to 1 message per day per recipient
• For production campaigns, upgrade to Twilio WhatsApp Business API

🚀 For unlimited messaging, upgrade to production WhatsApp Business API at:
https://console.twilio.com/us1/develop/sms/whatsapp/senders`
    }
    return "✅ Using production WhatsApp Business API - no setup required"
  }

  async validateRecipient(phoneNumber: string): Promise<boolean> {
    try {
      // Format phone number
      let formattedPhone = phoneNumber.replace(/\D/g, "")
      if (!formattedPhone.startsWith("91") && formattedPhone.length === 10) {
        formattedPhone = "91" + formattedPhone
      }

      const toNumber = `whatsapp:+${formattedPhone}`

      // Send a test message to check if recipient is valid
      const testResult = await this.client.messages.create({
        from: this.fromNumber,
        to: toNumber,
        body: "Test message - validating recipient",
      })

      // Check status after a delay
      await new Promise((resolve) => setTimeout(resolve, 3000))
      const messageStatus = await this.client.messages(testResult.sid).fetch()

      return messageStatus.status !== "failed"
    } catch (error) {
      console.error(`[WhatsApp] Recipient validation failed for ${phoneNumber}:`, error)
      return false
    }
  }

  async checkRecipientOptIn(phoneNumber: string): Promise<{ isOptedIn: boolean; message: string }> {
    try {
      let formattedPhone = phoneNumber.replace(/\D/g, "")
      if (!formattedPhone.startsWith("91") && formattedPhone.length === 10) {
        formattedPhone = "91" + formattedPhone
      }

      const toNumber = `whatsapp:+${formattedPhone}`

      if (!this.isSandboxMode()) {
        return { isOptedIn: true, message: "Production API - no opt-in required" }
      }

      // For sandbox, we can't directly check opt-in status
      // But we can provide guidance
      return {
        isOptedIn: false,
        message: `Sandbox mode: Recipient must send "join ${this.getSandboxKeyword()}" to ${this.fromNumber}`,
      }
    } catch (error) {
      return {
        isOptedIn: false,
        message: `Error checking opt-in status: ${error instanceof Error ? error.message : "Unknown error"}`,
      }
    }
  }

  public getSMSConfigurationStatus(): { configured: boolean; message: string } {
    if (this.isSMSConfigured) {
      return {
        configured: true,
        message: `SMS fallback enabled with number: ${this.smsFromNumber}`,
      }
    } else {
      return {
        configured: false,
        message: `SMS fallback disabled. Please set TWILIO_SMS_FROM to a valid Twilio phone number to enable SMS fallback.`,
      }
    }
  }
}

// Export singleton instance
export const whatsappService = new WhatsAppService()
*/

interface OrderDetails {
  orderId: string
  customerName: string
  customerPhone: string
  products: Array<{
    title: string
    quantity: number
    price: number
  }>
  totalAmount: number
  paymentMethod: string
  status: string
  createdAt: string
}

interface MarketingMessageDetails {
  phone: string
  name: string
  message: string
  campaignType?: "product_launch" | "offer" | "update" | "general"
  productLink?: string
  offerCode?: string
}

export class WhatsAppService {
  async sendOrderNotification(orderDetails: OrderDetails): Promise<boolean> {
    console.log("[WhatsApp] Service disabled - Twilio not configured")
    console.log("[WhatsApp] Order notification skipped for:", orderDetails.customerPhone)
    return false
  }

  async sendMarketingMessage(messageDetails: MarketingMessageDetails): Promise<boolean> {
    console.log("[WhatsApp] Service disabled - Twilio not configured")
    console.log("[WhatsApp] Marketing message skipped for:", messageDetails.phone)
    return false
  }

  async testConnection(): Promise<boolean> {
    console.log("[WhatsApp] Service disabled - Twilio not configured")
    return false
  }

  async validateRecipient(phoneNumber: string): Promise<boolean> {
    console.log("[WhatsApp] Service disabled - Twilio not configured")
    return false
  }

  async checkRecipientOptIn(phoneNumber: string): Promise<{ isOptedIn: boolean; message: string }> {
    return {
      isOptedIn: false,
      message: "WhatsApp service disabled - Twilio not configured",
    }
  }

  public getSMSConfigurationStatus(): { configured: boolean; message: string } {
    return {
      configured: false,
      message: "WhatsApp service disabled - Twilio not configured",
    }
  }

  public getSandboxInstructions(): string {
    return "WhatsApp service disabled - Twilio not configured"
  }

  public isSandboxMode(): boolean {
    return false
  }
}

// WhatsApp service is disabled - Twilio configuration not available
// export const whatsappService = new WhatsAppService()

// Stub export for compatibility
export const whatsappService = {
  sendOrderNotification: async () => false,
  sendMarketingMessage: async () => false,
  testConnection: async () => false,
  validateRecipient: async () => false,
  checkRecipientOptIn: async () => ({
    isOptedIn: false,
    message: "WhatsApp service disabled - Twilio not configured",
  }),
  getSMSConfigurationStatus: () => ({
    configured: false,
    message: "WhatsApp service disabled - Twilio not configured",
  }),
  getSandboxInstructions: () => "WhatsApp service disabled - Twilio not configured",
  isSandboxMode: () => false,
}
