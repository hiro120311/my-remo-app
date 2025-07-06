
import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';

type Props = {
  temperature: number;
  humidity: number;
  illumination: number;
};

export const SensorCard: React.FC<Props> = ({ temperature, humidity, illumination }) => {
  return (
    <Card sx={{ minWidth: 275, m: 2 }}>
      <CardContent>
        <Typography variant="h5">室内センサー</Typography>
        <Typography>🌡️ 温度: {temperature} °C</Typography>
        <Typography>💧 湿度: {humidity} %</Typography>
        <Typography>💡 照度: {illumination} lux</Typography>
      </CardContent>
    </Card>
  );
};
