import { Injectable } from '@angular/core';

type AlertType = 'success' | 'error' | 'warning' | 'info';

@Injectable({ providedIn: 'root' })

export class AlertService {

  // Máximo número de alertas simultáneas
  private readonly MAX_ALERTS = 4; 
  // Duración de las alertas en milisegundos
  private readonly ALERT_DURATION_MS = 4000;
  // Contenedor donde se mostrarán las alertas
  private alertsContainer: HTMLElement | null = null;

  // Método para agregar una alerta al contenedor por HTML
  constructor() {
    if (!document.querySelector('.alerts-container')) {
      this.alertsContainer = document.createElement('div');
      this.alertsContainer.className = 'alerts-container';
      document.body.appendChild(this.alertsContainer);
    }
  }

  // Método para mostrar una alerta en el contenedor
  show(message: string, type: AlertType = 'info', durationMs = this.ALERT_DURATION_MS) {
    
    // Verificar si hay un contenedor para las alertas
    const container = this.alertsContainer || document.querySelector('.alerts-container');
    if (!container) return;

    // Obtener el número actual de alertas en el contenedor
    const currentAlerts = container.children;

    // Eliminar la primera alerta si se supera el límite máximo
    if (currentAlerts.length >= this.MAX_ALERTS) {
      container.removeChild(currentAlerts[0]);
    }

    // Crear un nuevo elemento de alerta dependiendo del tipo
    const alertElement = document.createElement('div');
    alertElement.className = `alert alert-${type}`;
    alertElement.textContent = message;
    container.appendChild(alertElement);

    // Mostrar la alerta durante la duración especificada
    setTimeout(() => {
      alertElement.classList.add('hiding');
      setTimeout(() => alertElement.remove(), 300);
    }, durationMs);
  }
}