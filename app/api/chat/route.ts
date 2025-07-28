/* eslint-disable @typescript-eslint/no-explicit-any */
import { google } from "@ai-sdk/google";
import { streamText } from "ai";

// Type definitions
interface User {
    id: string;
    first_name: string | null;
    last_name: string | null;
    prn: string | null;
    email: string | null;
    course: string | null;
    gender: string | null;
    role: string;
    phone_number: string | null;
    user_type: string;
    created_at: string;
}

interface FacilityStats {
    totalSports: number;
    totalSlots: number;
    todayBookings: number;
    currentDate: string;
}

interface Slot {
    id: string;
    startTime: string;
    endTime: string;
    availableSeats: number;
    totalSeats: number;
    gender: string;
    allowedUserType: string;
}

interface Sport {
    id: string;
    name: string;
    slots: Slot[];
}

// Add notification interface
interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'general' | 'maintenance' | 'urgent';
    is_active: boolean;
    created_at: string;
    created_by: string | null;
}

interface SportsData {
    facilityStats: FacilityStats;
    currentUser?: User;
    sportsWithSlots: Sport[];
    notifications?: Notification[]; // Add notifications
}

// New processed data types for server-side validation
interface ProcessedSlot {
    id: string;
    timeDisplay: string; // "4:00 PM - 5:00 PM"
    status: 'ACTIVE' | 'EXPIRED' | 'FULL';
    availableSeats: number;
    totalSeats: number;
    canBook: boolean;
    bookingUrl?: string;
    gender: string;
    allowedUserType: string;
    statusReason?: string;
}

interface ProcessedSport {
    id: string;
    name: string;
    slots: ProcessedSlot[];
    hasAvailableSlots: boolean;
}

interface ProcessedData {
    facilityStats: FacilityStats;
    userInfo: string;
    currentTime: string;
    sports: ProcessedSport[];
    notifications: Notification[];
    serverTimestamp: number;
}

const getCurrentTime = (): string =>
    new Date().toLocaleTimeString("en-US", {
        hour12: false,
        timeZone: "Asia/Kolkata",
    });

const getCurrentTimestamp = (): number => Date.now();

const parseTimeToMinutes = (timeStr: string): number | null => {
    try {
        // Enhanced time parsing with validation
        if (!timeStr || typeof timeStr !== 'string') return null;
        
        const normalizedTime = timeStr.trim().toLowerCase();
        
        // Validate time format more strictly
        const timeRegex = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/;
        const match = normalizedTime.match(timeRegex);

        if (!match) return null;

        const hours = parseInt(match[1], 10);
        const minutes = parseInt(match[2], 10);
        const seconds = match[3] ? parseInt(match[3], 10) : 0;

        // Strict validation
        if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59 || seconds < 0 || seconds > 59) {
            return null;
        }

        return hours * 60 + minutes;
    } catch (error) {
        console.warn(`[TIME_PARSE_ERROR] Invalid time format: ${timeStr}`, error);
        return null;
    }
};

// Simplified system prompt using pre-processed data
const createSystemPrompt = (processedData: ProcessedData | null): string => {
    if (!processedData) {
        return `You are Courtside AI - MIT-WPU's intelligent sports facility assistant.

❌ No facility data available at the moment. You can still help with:
• General sports knowledge and guidance
• MIT-WPU information and student support
• Navigation: [Dashboard](/dashboard), [My Bookings](/my-bookings), [Booking History](/my-bookings/booking-history), [Profile](/profile), [Edit Profile](/profile/edit), [Notifications](/notifications), [Sports](/sports), [Rules](/rules), [Terms](/terms)
• General conversation and questions

🎨 CREATOR INFO (only when asked):
Created by Subhajit Dolai, a student at MIT-WPU. Connect: [LinkedIn](https://www.linkedin.com/in/subhajit-dolai/)

Please try again later for booking assistance.

🌟 Keep responses concise, helpful, and under 1000 tokens!`;
    }

    const overview = generateUserFriendlyOverview(processedData);
    
    return `You are Courtside AI - MIT-WPU's intelligent sports facility assistant.

${overview}

🎯 YOUR ROLE:
• Help users find and book available sports slots
• Provide sports guidance and general knowledge
• Share important facility notifications and announcements
• Assist with MIT-WPU information and student success
• Maintain a helpful, concise, and supportive tone
• IMPORTANT: Be strategic with booking links - don't overwhelm users with every option

📢 NOTIFICATION HANDLING:
• Only show notifications/notices if they are present in the provided database data—never invent or assume notices
• When users ask about "news", "notices", "announcements", or "updates", show relevant notifications if available
• Prioritize urgent notifications (🚨) over maintenance (🔧) and general (📋) ones
• Always mention the notification type and when it was posted
• For urgent notifications, emphasize their importance
• Keep notification summaries concise but informative

💡 SMART RESPONSE STRATEGY:
• For general "what's available" queries: Summarize sports and slot counts, show 2-3 best options
• For specific sport requests: Show relevant slots for that sport only
• For time-specific requests: Show slots matching that timeframe
• Always prioritize slots starting soon or matching user preferences
• Use phrases like "Here are some great options" instead of listing everything

� BOOKING RULES:
• EVERYONE IS REQUIRED TO BOOK THEIR OWN SLOT. For example, if 2 people want to play, 2 people must book; if 4, then 4 bookings are needed—no group booking under one name.
• CRITICAL: Be selective with booking links to stay under 1000 tokens
• Only show 3-5 most relevant booking links, not all available slots
• Prioritize current time and upcoming slots
• Never create booking links for expired or full slots
• All slot data above is pre-validated and permission-filtered
• When user asks for specific sport/time, show only those relevant links
• For general queries, summarize availability without showing all links

📊 CAPABILITIES:
• Real-time slot availability (pre-processed above)
• Smart recommendations based on user preferences
• Navigation: [Dashboard](/dashboard), [My Bookings](/my-bookings), [Booking History](/my-bookings/booking-history), [Profile](/profile), [Edit Profile](/profile/edit), [Notifications](/notifications), [Sports](/sports), [Rules](/rules), [Terms](/terms)
• General sports knowledge (rules, techniques, history, nutrition, careers)
• MIT-WPU guidance and student support (always positive and encouraging)
• Personal assistance using user profile data
• General conversation on any topic

🎨 CREATOR INFO (only when asked):
Created by Subhajit Dolai, a student at MIT-WPU. This platform showcases expertise in Next.js, Supabase realtime, TypeScript, and modern web development. Tech stack: React, Tailwind CSS, Radix UI, AI SDK. Connect: [LinkedIn](https://www.linkedin.com/in/subhajit-dolai/)

🌟 RESPONSE GUIDELINES:
• Keep responses under 1000 tokens - be concise!
• NEVER list all available booking links - be selective (max 3-5 links)
• Focus on most relevant slots based on user query
• Summarize availability instead of showing every option
• Use friendly, conversational tone with helpful information
• Always speak positively about MIT-WPU
• Provide actionable advice and clear next steps
• Use emojis sparingly for clarity and warmth
• Address users by their first name when available
• Use 12-hour time format (4:00 PM not 16:00)
• Use markdown links: [Book Now →](/sports/[id]/slots/[id]/seats)

⏰ TIME PARSING EXAMPLES:
"4pm" = 4:00 PM slot | "4-5pm" = 4:00 PM - 5:00 PM slot

👤 USER PERSONALIZATION:
• Reference course/program for students or department for faculty
• Use PRN for students, Employee ID for faculty (stored in course field)
• Don't mention role unless it's 'admin'`;
};

// New server-side processing functions
const formatTo12Hour = (timeStr: string): string => {
    try {
        const [hours, minutes] = timeStr.split(':').map(Number);
        const period = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
        return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
    } catch {
        return timeStr;
    }
};

const checkUserPermissions = (slot: Slot, user?: User): boolean => {
    if (!user) return false;
    
    // Check gender permission
    const genderMatch = slot.gender === "any" || slot.gender === user.gender;
    
    // Check user type permission  
    const userTypeMatch = slot.allowedUserType === "any" || slot.allowedUserType === user.user_type;
    
    return genderMatch && userTypeMatch;
};

const determineSlotStatus = (slot: Slot, currentMinutes: number): 'ACTIVE' | 'EXPIRED' | 'FULL' => {
    // Parse slot times
    const startMinutes = parseTimeToMinutes(slot.startTime);
    const endMinutes = parseTimeToMinutes(slot.endTime);
    
    if (startMinutes === null || endMinutes === null) return 'EXPIRED';
    
    // Check if slot has ended
    if (currentMinutes >= endMinutes) return 'EXPIRED';
    
    // Check if slot is full
    if (slot.availableSeats <= 0) return 'FULL';
    
    return 'ACTIVE';
};

const processAllSportsData = (sportsData: SportsData | null): ProcessedData | null => {
    console.log('[DEBUG] Processing sports data:', {
        hasData: !!sportsData,
        hasNotifications: !!sportsData?.notifications,
        notificationsCount: sportsData?.notifications?.length || 0
    });
    
    if (!sportsData) return null;
    
    try {
        const currentTime = getCurrentTime();
        const currentMinutes = parseTimeToMinutes(currentTime);
        
        if (currentMinutes === null) {
            console.error("[PROCESS_ERROR] Failed to parse current time");
            return null;
        }
        
        const userInfo = sportsData.currentUser 
            ? `${sportsData.currentUser.user_type.toUpperCase()} (${sportsData.currentUser.gender?.toUpperCase() || 'N/A'}) - ${sportsData.currentUser.first_name || 'N/A'} ${sportsData.currentUser.last_name || 'N/A'} | ${sportsData.currentUser.user_type === 'faculty' ? `Department: ${sportsData.currentUser.course || 'N/A'} | Employee ID: ${sportsData.currentUser.prn || 'N/A'}` : `PRN: ${sportsData.currentUser.prn || 'N/A'} | Course: ${sportsData.currentUser.course || 'N/A'}`} | Email: ${sportsData.currentUser.email || 'N/A'} | Phone: ${sportsData.currentUser.phone_number || 'N/A'} | Role: ${sportsData.currentUser.role}`
            : "GUEST";
        
        const processedSports: ProcessedSport[] = sportsData.sportsWithSlots.map(sport => {
            const processedSlots: ProcessedSlot[] = sport.slots
                .filter(slot => {
                    // Additional validation for slot data
                    if (!slot.id || !slot.startTime || !slot.endTime) {
                        console.warn(`[SLOT_VALIDATION] Invalid slot data in sport ${sport.id}:`, slot);
                        return false;
                    }
                    return checkUserPermissions(slot, sportsData.currentUser);
                })
                .map(slot => {
                    const status = determineSlotStatus(slot, currentMinutes);
                    const timeDisplay = `${formatTo12Hour(slot.startTime)} - ${formatTo12Hour(slot.endTime)}`;
                    
                    const canBook = status === 'ACTIVE' && checkUserPermissions(slot, sportsData.currentUser);
                    const bookingUrl = canBook ? `/sports/${sport.id}/slots/${slot.id}/seats` : undefined;
                    
                    let statusReason: string | undefined;
                    if (status === 'EXPIRED') {
                        statusReason = 'This slot has ended for today';
                    } else if (status === 'FULL') {
                        statusReason = 'This slot is fully booked';
                    }
                    
                    return {
                        id: slot.id,
                        timeDisplay,
                        status,
                        availableSeats: slot.availableSeats,
                        totalSeats: slot.totalSeats,
                        canBook,
                        bookingUrl,
                        gender: slot.gender,
                        allowedUserType: slot.allowedUserType,
                        statusReason
                    };
                });
            
            return {
                id: sport.id,
                name: sport.name,
                slots: processedSlots,
                hasAvailableSlots: processedSlots.some(slot => slot.canBook)
            };
        }).filter(sport => sport.slots.length > 0);
        
        return {
            facilityStats: sportsData.facilityStats,
            userInfo,
            currentTime,
            sports: processedSports,
            notifications: sportsData.notifications || [],
            serverTimestamp: getCurrentTimestamp()
        };
    } catch (error) {
        console.error("[PROCESS_ERROR] Failed to process sports data:", error);
        return null;
    }
};

const generateUserFriendlyOverview = (processedData: ProcessedData): string => {
    console.log('[DEBUG] Generating overview with notifications:', {
        hasNotifications: !!processedData.notifications,
        notificationsCount: processedData.notifications?.length || 0,
        activeNotifications: processedData.notifications?.filter(n => n.is_active)?.length || 0
    });
    
    const availableSportsCount = processedData.sports.filter(sport => sport.hasAvailableSlots).length;
    const totalSlotsCount = processedData.sports.reduce((sum, sport) => sum + sport.slots.length, 0);
    
    let overview = `📊 FACILITY STATUS:\n`;
    overview += `• ${availableSportsCount} sports with available slots\n`;
    overview += `• ${totalSlotsCount} total accessible slots\n`;
    overview += `• ${processedData.facilityStats.todayBookings} bookings today\n`;
    overview += `• Current time: ${processedData.currentTime}\n`;
    overview += `• User: ${processedData.userInfo}\n\n`;
    
    // Add notifications section
    if (processedData.notifications && processedData.notifications.length > 0) {
        overview += `📢 ACTIVE NOTIFICATIONS:\n`;
        processedData.notifications
            .filter(notification => notification.is_active)
            .slice(0, 3) // Show max 3 notifications to save tokens
            .forEach(notification => {
                const urgencyIcon = notification.type === 'urgent' ? '🚨' : 
                                   notification.type === 'maintenance' ? '🔧' : '📋';
                overview += `${urgencyIcon} ${notification.title}: ${notification.message}\n`;
            });
        overview += `\n`;
    }
    
    if (processedData.sports.length === 0) {
        overview += `❌ No slots available for your user type and gender.\n`;
        return overview;
    }
    
    overview += `🏃 AVAILABLE SPORTS:\n`;
    for (const sport of processedData.sports) {
        overview += `\n🏸 ${sport.name.toUpperCase()}:\n`;
        
        if (sport.slots.length === 0) {
            overview += `  ❌ No accessible slots\n`;
            continue;
        }
        
        for (const slot of sport.slots) {
            const statusIcon = slot.status === 'ACTIVE' ? '🟢' : 
                              slot.status === 'FULL' ? '🟡' : '🔴';
            const seats = `${slot.availableSeats}/${slot.totalSeats} seats`;
            
            overview += `  ${statusIcon} ${slot.timeDisplay} (${seats})`;
            
            if (slot.canBook && slot.bookingUrl) {
                overview += ` → [Book Now](${slot.bookingUrl})`;
            } else if (slot.statusReason) {
                overview += ` → ${slot.statusReason}`;
            }
            overview += `\n`;
        }
    }
    
    return overview;
};

// Enterprise-level validation and security functions
const validateAndSanitizeInput = (data: any): { isValid: boolean; sanitized?: any; error?: string } => {
    try {
        // Add debug logging
        console.log('[DEBUG] Validating input data:', {
            hasData: !!data,
            hasFacilityStats: !!data?.facilityStats,
            hasSportsWithSlots: !!data?.sportsWithSlots,
            hasNotifications: !!data?.notifications,
            notificationsLength: data?.notifications?.length || 0,
            dataKeys: data ? Object.keys(data) : []
        });

        // Basic structure validation
        if (!data || typeof data !== 'object') {
            return { isValid: false, error: "Invalid data structure" };
        }

        // Validate facilityStats
        if (data.facilityStats) {
            const stats = data.facilityStats;
            if (typeof stats.totalSports !== 'number' || stats.totalSports < 0 ||
                typeof stats.totalSlots !== 'number' || stats.totalSlots < 0 ||
                typeof stats.todayBookings !== 'number' || stats.todayBookings < 0) {
                return { isValid: false, error: "Invalid facility stats" };
            }
        }

        // Validate sportsWithSlots array
        if (data.sportsWithSlots && !Array.isArray(data.sportsWithSlots)) {
            return { isValid: false, error: "Invalid sports data structure" };
        }

        // Sanitize and validate each sport
        const sanitizedSports = data.sportsWithSlots?.map((sport: any) => {
            if (!sport.id || !sport.name || !Array.isArray(sport.slots)) {
                throw new Error(`Invalid sport structure: ${sport.id || 'unknown'}`);
            }

            return {
                id: String(sport.id).trim(),
                name: String(sport.name).trim(),
                slots: sport.slots.map((slot: any) => {
                    if (!slot.id || !slot.startTime || !slot.endTime) {
                        throw new Error(`Invalid slot structure in sport ${sport.id}`);
                    }

                    return {
                        id: String(slot.id).trim(),
                        startTime: String(slot.startTime || slot.start_time).trim(),
                        endTime: String(slot.endTime || slot.end_time).trim(),
                        availableSeats: Math.max(0, parseInt(slot.availableSeats) || 0),
                        totalSeats: Math.max(1, parseInt(slot.totalSeats) || 1),
                        gender: String(slot.gender || 'any').trim().toLowerCase(),
                        allowedUserType: String(slot.allowedUserType || slot.allowed_user_type || 'any').trim().toLowerCase()
                    };
                })
            };
        }) || [];

        return {
            isValid: true,
            sanitized: {
                facilityStats: data.facilityStats,
                currentUser: data.currentUser,
                sportsWithSlots: sanitizedSports,
                notifications: data.notifications || [] // Include notifications in sanitized data
            }
        };
    } catch (error) {
        return { 
            isValid: false, 
            error: error instanceof Error ? error.message : "Data validation failed" 
        };
    }
};

const generateRequestId = (): string => {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const logAuditEvent = (event: string, requestId: string, userId?: string, details?: any) => {
    const logEntry = {
        timestamp: new Date().toISOString(),
        requestId,
        userId: userId || 'anonymous',
        event,
        details: details || {},
        environment: process.env.NODE_ENV || 'unknown'
    };
    
    console.log(`[AUDIT] ${JSON.stringify(logEntry)}`);
};

// Enterprise content filtering and security
const contentFilter = {
    // Detect potential prompt injection attempts
    detectPromptInjection: (content: string): boolean => {
        const suspiciousPatterns = [
            /ignore\s+previous\s+instructions/i,
            /forget\s+everything/i,
            /you\s+are\s+now/i,
            /system\s*[:=]\s*[^a-zA-Z]/i,
            /```[\s\S]*system[\s\S]*```/i,
            /<script[^>]*>/i,
            /javascript:/i,
            /data:text\/html/i
        ];
        
        return suspiciousPatterns.some(pattern => pattern.test(content));
    },

    // Sanitize user input
    sanitizeContent: (content: string): string => {
        return content
            .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '[SCRIPT_REMOVED]')
            .replace(/javascript:/gi, 'blocked:')
            .replace(/data:text\/html/gi, 'blocked:')
            .trim();
    },

    // Check for sensitive data exposure
    containsSensitiveData: (content: string): boolean => {
        const sensitivePatterns = [
            /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/, // Credit card
            /\b\d{3}-\d{2}-\d{4}\b/, // SSN
            /password\s*[:=]\s*\S+/i,
            /api[_-]?key\s*[:=]\s*\S+/i,
            /secret\s*[:=]\s*\S+/i
        ];
        
        return sensitivePatterns.some(pattern => pattern.test(content));
    }
};

// Performance monitoring
const performanceMonitor = {
    startTimer: () => performance.now(),
    
    endTimer: (startTime: number, operation: string, requestId: string) => {
        const duration = performance.now() - startTime;
        
        if (duration > 5000) { // Log slow operations
            console.warn(`[PERFORMANCE_WARNING] ${operation} took ${Math.round(duration)}ms`, {
                requestId,
                operation,
                duration
            });
        }
        
        return duration;
    }
};

// POST handler for chat API
export async function POST(req: Request) {
    const requestId = generateRequestId();
    const startTime = performance.now();
    
    try {
        // Parse and validate request body
        let body;
        try {
            body = await req.json();
        } catch (error) {
            console.log("Error:", error)
            logAuditEvent('INVALID_JSON', requestId, undefined, { error: 'Failed to parse JSON body' });
            return new Response("Invalid JSON format", { status: 400 });
        }

        const { messages, sportsData } = body;

        // Enhanced input validation
        if (!messages || !Array.isArray(messages)) {
            logAuditEvent('INVALID_INPUT', requestId, undefined, { error: 'Invalid messages format' });
            return new Response("Invalid messages format", { status: 400 });
        }

        // Validate message structure and content
        for (const message of messages) {
            if (!message || typeof message !== 'object' || !message.role || !message.content) {
                logAuditEvent('INVALID_MESSAGE', requestId, undefined, { error: 'Invalid message structure' });
                return new Response("Invalid message structure", { status: 400 });
            }

            // Security: Check for prompt injection attempts
            if (contentFilter.detectPromptInjection(message.content)) {
                logAuditEvent('PROMPT_INJECTION_DETECTED', requestId, undefined, { 
                    role: message.role,
                    contentLength: message.content.length 
                });
                return new Response("Invalid content detected", { status: 400 });
            }

            // Security: Check for sensitive data
            if (contentFilter.containsSensitiveData(message.content)) {
                logAuditEvent('SENSITIVE_DATA_DETECTED', requestId, undefined, { 
                    role: message.role 
                });
                return new Response("Sensitive content detected", { status: 400 });
            }

            // Sanitize content
            message.content = contentFilter.sanitizeContent(message.content);
        }

        // Rate limiting check (basic)
        const messageCount = messages.length;
        if (messageCount > 150) {
            logAuditEvent('RATE_LIMIT_EXCEEDED', requestId, undefined, { messageCount });
            return new Response("Too many messages in request", { status: 429 });
        }

        // Sanitize and validate sports data
        let transformedSportsData: SportsData | null = null;
        if (sportsData) {
            const validation = validateAndSanitizeInput(sportsData);
            if (!validation.isValid) {
                logAuditEvent('DATA_VALIDATION_FAILED', requestId, sportsData?.currentUser?.id, { 
                    error: validation.error 
                });
                return new Response(`Data validation failed: ${validation.error}`, { status: 400 });
            }
            transformedSportsData = validation.sanitized;
        }

        // Log successful request
        logAuditEvent('REQUEST_PROCESSED', requestId, transformedSportsData?.currentUser?.id, {
            hasData: !!transformedSportsData,
            messageCount
        });

        // Process all data server-side
        const processingStartTime = performanceMonitor.startTimer();
        const processedData = processAllSportsData(transformedSportsData);
        performanceMonitor.endTimer(processingStartTime, 'DATA_PROCESSING', requestId);

        // Validate processed data before sending to AI
        if (!processedData && transformedSportsData) {
            logAuditEvent('PROCESSING_FAILED', requestId, transformedSportsData?.currentUser?.id, {
                error: 'Failed to process sports data'
            });
            console.warn("Failed to process sports data - invalid time format or data structure");
        }

        // Generate clean, simple system prompt with processed data
        const promptStartTime = performanceMonitor.startTimer();
        const systemPrompt = createSystemPrompt(processedData);
        performanceMonitor.endTimer(promptStartTime, 'PROMPT_GENERATION', requestId);

        // Enhanced AI model configuration for enterprise use
        const aiStartTime = performanceMonitor.startTimer();
        const result = await streamText({
            model: google("gemini-2.0-flash"),
            messages,
            system: systemPrompt,
            temperature: 0.7,
            maxTokens: 1000,
            topP: 0.8,
            topK: 40,
            frequencyPenalty: 0.1,
            presencePenalty: 0.1,
            stopSequences: ["EXPIRED 🔴", "BLOCKED", "```json", "VIOLATION", "CRITICAL ERROR"],
        });
        const aiDuration = performanceMonitor.endTimer(aiStartTime, 'AI_GENERATION', requestId);

        // Log successful response
        const endTime = performance.now();
        logAuditEvent('RESPONSE_SENT', requestId, transformedSportsData?.currentUser?.id, {
            totalProcessingTime: Math.round(endTime - startTime),
            aiGenerationTime: Math.round(aiDuration),
            hasProcessedData: !!processedData,
            sportsCount: processedData?.sports?.length || 0
        });

        return result.toDataStreamResponse();
    } catch (error) {
        // Log error with audit trail
        logAuditEvent('SYSTEM_ERROR', requestId, undefined, {
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined
        });
        
        console.error("Chat API error:", error);
        
        // Return more specific error information in development
        const isDevelopment = process.env.NODE_ENV === 'development';
        const errorMessage = isDevelopment && error instanceof Error 
            ? `Internal Server Error: ${error.message}` 
            : "Internal Server Error";
            
        return new Response(errorMessage, { 
            status: 500,
            headers: {
                'X-Request-ID': requestId
            }
        });
    }
}
