// Event tracking utility to prevent duplicate processing
class EventTracker {
  constructor() {
    this.processedEvents = new Set();
    this.maxEventAge = 5000; // 5 seconds
  }

  // Generate a unique event ID
  generateEventId(eventType, payload) {
    const timestamp = Date.now();
    const payloadStr = JSON.stringify(payload);
    return `${eventType}_${timestamp}_${payloadStr}`;
  }

  // Check if event has been processed recently
  isEventProcessed(eventId) {
    return this.processedEvents.has(eventId);
  }

  // Mark event as processed
  markEventProcessed(eventId) {
    this.processedEvents.add(eventId);
    
    // Remove old events to prevent memory leaks
    setTimeout(() => {
      this.processedEvents.delete(eventId);
    }, this.maxEventAge);
  }

  // Process event only if not already processed
  processEvent(eventType, payload, callback) {
    const eventId = this.generateEventId(eventType, payload);
    
    if (this.isEventProcessed(eventId)) {
      return false; // Event already processed
    }
    
    this.markEventProcessed(eventId);
    callback(payload);
    return true; // Event processed
  }

  // Clear all processed events
  clear() {
    this.processedEvents.clear();
  }
}

// Create singleton instance
const eventTracker = new EventTracker();

export default eventTracker;
