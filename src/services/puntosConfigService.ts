import { API_ENDPOINTS } from '@/config/api';
import { httpClient } from './httpClient';
import { extractErrorMessage } from '@/utils/errorHandler';

export interface PuntosConfig {
  valorPunto: number;
  limiteCanjePorcentaje: number;
  factorOtorgamiento: number;
}

export interface UpdatePuntosConfigDto {
  valorPunto?: number;
  limiteCanjePorcentaje?: number;
  factorOtorgamiento?: number;
}

export const puntosConfigService = {
  get: async (): Promise<PuntosConfig> => {
    try {
      return await httpClient.get<PuntosConfig>(API_ENDPOINTS.ADMIN.CONFIG_PUNTOS);
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  },

  update: async (dto: UpdatePuntosConfigDto): Promise<PuntosConfig> => {
    try {
      return await httpClient.patch<PuntosConfig>(API_ENDPOINTS.ADMIN.CONFIG_PUNTOS, dto);
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  },
};
