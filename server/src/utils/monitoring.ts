/**
 * Monitoring & Health Check Utilities
 * Track application metrics and health status
 */

export interface Metrics {
  uptime: number;
  timestamp: string;
  memory: NodeJS.MemoryUsage;
  requests: {
    total: number;
    success: number;
    errors: number;
    avgResponseTime: number;
  };
  activeConnections: number;
  cache?: {
    hits: number;
    misses: number;
    hitRate: number;
  };
}

export class MonitoringService {
  private startTime: number;
  private requestCount: number = 0;
  private successCount: number = 0;
  private errorCount: number = 0;
  private totalResponseTime: number = 0;
  private activeConnections: number = 0;

  constructor() {
    this.startTime = Date.now();
  }

  /**
   * Track a request
   */
  trackRequest(responseTime: number, success: boolean) {
    this.requestCount++;
    this.totalResponseTime += responseTime;
    
    if (success) {
      this.successCount++;
    } else {
      this.errorCount++;
    }
  }

  /**
   * Track connection
   */
  trackConnection(connected: boolean) {
    if (connected) {
      this.activeConnections++;
    } else {
      this.activeConnections = Math.max(0, this.activeConnections - 1);
    }
  }

  /**
   * Get current metrics
   */
  getMetrics(): Metrics {
    const uptime = (Date.now() - this.startTime) / 1000;
    const avgResponseTime = this.requestCount > 0 
      ? this.totalResponseTime / this.requestCount 
      : 0;

    return {
      uptime,
      timestamp: new Date().toISOString(),
      memory: process.memoryUsage(),
      requests: {
        total: this.requestCount,
        success: this.successCount,
        errors: this.errorCount,
        avgResponseTime,
      },
      activeConnections: this.activeConnections,
    };
  }

  /**
   * Check system health
   */
  checkHealth(): { healthy: boolean; checks: Record<string, boolean> } {
    const checks = {
      memory: this.checkMemoryUsage(),
      uptime: this.checkUptime(),
      requests: this.checkErrorRate(),
    };

    const healthy = Object.values(checks).every(check => check);

    return { healthy, checks };
  }

  /**
   * Check memory usage
   */
  private checkMemoryUsage(): boolean {
    const memoryUsage = process.memoryUsage();
    const heapUsedMB = memoryUsage.heapUsed / 1024 / 1024;
    const heapTotalMB = memoryUsage.heapTotal / 1024 / 1024;
    
    // Warn if using more than 80% of heap
    return (heapUsedMB / heapTotalMB) < 0.8;
  }

  /**
   * Check uptime (should be running)
   */
  private checkUptime(): boolean {
    const uptime = (Date.now() - this.startTime) / 1000;
    return uptime > 0;
  }

  /**
   * Check error rate
   */
  private checkErrorRate(): boolean {
    if (this.requestCount === 0) return true;
    
    const errorRate = this.errorCount / this.requestCount;
    return errorRate < 0.1; // Less than 10% error rate
  }

  /**
   * Reset metrics
   */
  reset() {
    this.requestCount = 0;
    this.successCount = 0;
    this.errorCount = 0;
    this.totalResponseTime = 0;
  }
}

// Singleton instance
export const monitoringService = new MonitoringService();
