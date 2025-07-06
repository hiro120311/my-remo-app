
import React, { useEffect, useState } from 'react';
import { Button } from '@mui/material';
import { fetchAppliances, setAircon } from '../api';

export const AirconControl = () => {
  const [airconId, setAirconId] = useState<string | null>(null);

  useEffect(() => {
    fetchAppliances().then(data => {
      const aircon = data.find((a: any) => a.type === 'AC');
      if (aircon) setAirconId(aircon.id);
    });
  }, []);

  const turnOn = () => {
    if (!airconId) return;
    setAircon(airconId, {
      operation_mode: 'cool',
      temperature: '26',
      air_volume: 'auto',
    });
  };

  const turnOff = () => {
    if (!airconId) return;
    setAircon(airconId, {
      operation_mode: 'power-off',
      temperature: '',
      air_volume: '',
    });
  };

  return (
    <>
      <Button variant="contained" color="primary" onClick={turnOn} sx={{ m: 1 }}>
        冷房 ON（26℃）
      </Button>
      <Button variant="outlined" color="secondary" onClick={turnOff} sx={{ m: 1 }}>
        電源 OFF
      </Button>
    </>
  );
};
