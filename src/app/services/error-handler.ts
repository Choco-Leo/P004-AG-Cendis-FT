import { Injectable } from '@angular/core';
import { AlertService } from './alert';

// Interfaz para el manejo de errores
export interface ErrorValidacion {
  campo: string;
  mensaje: string;
}

// Interfaz para la respuesta de error
export interface ResponseError {
  success: boolean;
  message: string;
  errors?: ErrorValidacion[];
}

@Injectable({
  providedIn: 'root'
})

export class ErrorHandlerService {

  constructor(private alert: AlertService) {}

  //Método para manejar errores
  handleError(response: ResponseError, defaultMessage: string = 'Ha ocurrido un error') {
    if (response?.errors && Array.isArray(response.errors)) {
      // Mostrar mensajes de error por campo
      response.errors.forEach((error: ErrorValidacion) => {
        const mensaje = error.campo !== 'general' 
          ? `${error.campo}: ${error.mensaje}`
          : error.mensaje;
        this.alert.show(mensaje, 'error');
      });
    } 
    else if (response?.message) {
      // Mostrar mensaje general de error
      this.alert.show(response.message, 'error');
    } 
    else {
      // Mostrar mensaje por defecto
      this.alert.show(defaultMessage, 'error');
    }
  }

  //Método para manejar errores de HTTP
  handleHttpError(error: any, defaultMessage: string) {
    if (error?.error) {
      this.handleError(error.error, defaultMessage);
    } else {
      this.alert.show(defaultMessage, 'error');
    }
  }
}