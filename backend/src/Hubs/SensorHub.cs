using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace StudentApp.Hubs
{
    public class SensorHub : Hub
    {
        public async Task SendSensorData(object sensorData)
        {
            // Broadcast sensor data to all connected clients
            await Clients.All.SendAsync("ReceiveSensorData", sensorData);
        }
    }
}