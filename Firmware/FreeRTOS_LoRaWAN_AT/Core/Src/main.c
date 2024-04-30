/* USER CODE BEGIN Header */
/**
  ******************************************************************************
  * @file           : main.c
  * @brief          : Main program body
  ******************************************************************************
  * @attention
  *
  * <h2><center>&copy; Copyright (c) 2020 STMicroelectronics.
  * All rights reserved.</center></h2>
  *
  * This software component is licensed by ST under Ultimate Liberty license
  * SLA0044, the "License"; You may not use this file except in compliance with
  * the License. You may obtain a copy of the License at:
  *                             www.st.com/SLA0044
  *
  ******************************************************************************
  */
/* USER CODE END Header */
/* Includes ------------------------------------------------------------------*/
#include "main.h"
#include "cmsis_os.h"
#include "app_lorawan.h"
#include "sys_app.h"
#include "lora_at.h"
#include "i2c.h"
#include "bme68x.h"
#include "common.h"
#include "stdio.h"
#include "stdlib.h"
#include "Message.pb.h"
#include "pb_encode.h"
#include "pb_common.h"
#include "pb.h"
#include "bsec_integration.h"


#if (OUTPUT_MODE == CLASSIFICATION || OUTPUT_MODE == REGRESSION)
#define NUM_USED_OUTPUTS 9
#elif (OUTPUT_MODE == IAQ)
#define NUM_USED_OUTPUTS 13
#endif


/* Private variables ---------------------------------------------------------*/
LPTIM_HandleTypeDef hlptim1;
//char dataStr[64];
//I2C_HandleTypeDef hi2c2;
/* USER CODE BEGIN PV */

/* USER CODE END PV */

/* Private function prototypes -----------------------------------------------*/
void SystemClock_Config(void);
void MX_GPIO_Init(void);
static void MX_LPTIM1_Init(void);
/* USER CODE BEGIN PFP */

//for printf
/*#ifdef __GNUC__
#define PUTCHAR_PROTOTYPE int __io_putchar(int ch)
#else
#define PUTCHAR_PROTOTYPE int fputc(int ch, FILE *f)
#endif

PUTCHAR_PROTOTYPE
{
  HAL_UART_Transmit(&huart1, (uint8_t *)&ch, 1, HAL_MAX_DELAY);
  return ch;
}*/

int32_t LED_control(int value);
/* Private includes ----------------------------------------------------------*/
/* USER CODE BEGIN Includes */

/* USER CODE END Includes */

/* Private typedef -----------------------------------------------------------*/
/* USER CODE BEGIN PTD */

/* USER CODE END PTD */

/* Private define ------------------------------------------------------------*/
/* USER CODE BEGIN PD */
/* USER CODE END PD */

/* Private macro -------------------------------------------------------------*/
/* USER CODE BEGIN PM */

/* USER CODE END PM */

/* Private variables ---------------------------------------------------------*/

/* USER CODE BEGIN PV */

/* USER CODE END PV */
//osThreadId LED_TaskHandle;
osThreadId LoRaWAN_TaskHandle;
osThreadId Monitor_TaskHandle;
/* Private function prototypes -----------------------------------------------*/
void StartLoRaWANTask(void const * argument);
//void StartLedTask(void const * argument);
void StartMonitorTask(void const * argument);
void SystemClock_Config(void);
/* USER CODE BEGIN PFP */

/* USER CODE END PFP */

/* Private user code ---------------------------------------------------------*/
/* USER CODE BEGIN 0 */
output_t output0, output1;
/* USER CODE END 0 */

/**
  * @brief  The application entry point.
  * @retval int
  */
int main(void)
{
	//CoreDebug->DEMCR |= CoreDebug_DEMCR_TRCENA_Msk;
	//DWT->CYCCNT = 0;
	//DWT->CTRL |= DWT_CTRL_CYCCNTENA_Msk;
  /* USER CODE BEGIN 1 */

  /* USER CODE END 1 */

  /* MCU Configuration--------------------------------------------------------*/

  /* Reset of all peripherals, Initializes the Flash interface and the Systick. */
  HAL_Init();

  /* USER CODE BEGIN Init */

  /* USER CODE END Init */

  /* Configure the system clock */
  SystemClock_Config();

  /* USER CODE BEGIN SysInit */
  MX_GPIO_Init();
  MX_LPTIM1_Init();
  MX_I2C2_Init();
  //MX_USART1_UART_Init();
  //MX_LoRaWAN_Init();
  /* USER CODE END SysInit */


  //struct bme68x_dev bme;
  //int8_t rslt;
  //rslt = bme68x_interface_init(&bme, BME68X_I2C_INTF);
  //APP_PPRINTF("%d", rslt);
  //rslt = read_variant_id(&bme);
  //APP_PPRINTF("%d", rslt);


  /* Initialize all configured peripherals */
  /* USER CODE BEGIN 2 */
  //osThreadDef(LED_Task, StartLedTask, osPriorityNormal, 0, 128);
  //LED_TaskHandle = osThreadCreate(osThread(LED_Task), NULL);
  osThreadDef(LoRaWAN_Task, StartLoRaWANTask, osPriorityNormal, 0, 1024);
  LoRaWAN_TaskHandle = osThreadCreate(osThread(LoRaWAN_Task), NULL);
  osThreadDef(Monitor_Task, StartMonitorTask, osPriorityAboveNormal, 0, 2048);//2048
  Monitor_TaskHandle = osThreadCreate(osThread(Monitor_Task), NULL);
  osKernelStart();
  /* USER CODE END 2 */
  /* Infinite loop */
  /* USER CODE BEGIN WHILE */
  while (1)
  {
    /* USER CODE END WHILE */

    /* USER CODE BEGIN 3 */
  }
  /* USER CODE END 3 */
}

/**
  * @brief System Clock Configuration
  * @retval None
  */
void SystemClock_Config(void)
{
  RCC_OscInitTypeDef RCC_OscInitStruct = {0};
  RCC_ClkInitTypeDef RCC_ClkInitStruct = {0};

  /** Configure LSE Drive Capability
  */
  HAL_PWR_EnableBkUpAccess();
  __HAL_RCC_LSEDRIVE_CONFIG(RCC_LSEDRIVE_LOW);
  /** Configure the main internal regulator output voltage
  */
  __HAL_PWR_VOLTAGESCALING_CONFIG(PWR_REGULATOR_VOLTAGE_SCALE1);
  /** Initializes the CPU, AHB and APB busses clocks
  */
  RCC_OscInitStruct.OscillatorType = RCC_OSCILLATORTYPE_LSE|RCC_OSCILLATORTYPE_MSI|RCC_OSCILLATORTYPE_LSI;
  RCC_OscInitStruct.LSEState = RCC_LSE_ON;
  RCC_OscInitStruct.MSIState = RCC_MSI_ON;
  RCC_OscInitStruct.MSICalibrationValue = RCC_MSICALIBRATION_DEFAULT;
  RCC_OscInitStruct.MSIClockRange = RCC_MSIRANGE_11;
  RCC_OscInitStruct.LSIDiv = RCC_LSI_DIV1;
  RCC_OscInitStruct.LSIState = RCC_LSI_ON;
  RCC_OscInitStruct.PLL.PLLState = RCC_PLL_NONE;
  if (HAL_RCC_OscConfig(&RCC_OscInitStruct) != HAL_OK)
  {
    Error_Handler();
  }
  /** Configure the SYSCLKSource, HCLK, PCLK1 and PCLK2 clocks dividers
  */
  RCC_ClkInitStruct.ClockType = RCC_CLOCKTYPE_HCLK3|RCC_CLOCKTYPE_HCLK
                              |RCC_CLOCKTYPE_SYSCLK|RCC_CLOCKTYPE_PCLK1
                              |RCC_CLOCKTYPE_PCLK2;
  RCC_ClkInitStruct.SYSCLKSource = RCC_SYSCLKSOURCE_MSI;
  RCC_ClkInitStruct.AHBCLKDivider = RCC_SYSCLK_DIV1;
  RCC_ClkInitStruct.APB1CLKDivider = RCC_HCLK_DIV1;
  RCC_ClkInitStruct.APB2CLKDivider = RCC_HCLK_DIV1;
  RCC_ClkInitStruct.AHBCLK3Divider = RCC_SYSCLK_DIV1;

  if (HAL_RCC_ClockConfig(&RCC_ClkInitStruct, FLASH_LATENCY_2) != HAL_OK)
  {
    Error_Handler();
  }
}

/**
  * @brief LPTIM1 Initialization Function
  * @param None
  * @retval None
  */
static void MX_LPTIM1_Init(void)
{

  /* USER CODE BEGIN LPTIM1_Init 0 */

  /* USER CODE END LPTIM1_Init 0 */

  /* USER CODE BEGIN LPTIM1_Init 1 */

  /* USER CODE END LPTIM1_Init 1 */
  hlptim1.Instance = LPTIM1;
  hlptim1.Init.Clock.Source = LPTIM_CLOCKSOURCE_APBCLOCK_LPOSC;
  hlptim1.Init.Clock.Prescaler = LPTIM_PRESCALER_DIV1;
  hlptim1.Init.Trigger.Source = LPTIM_TRIGSOURCE_SOFTWARE;
  hlptim1.Init.OutputPolarity = LPTIM_OUTPUTPOLARITY_HIGH;
  hlptim1.Init.UpdateMode = LPTIM_UPDATE_IMMEDIATE;
  hlptim1.Init.CounterSource = LPTIM_COUNTERSOURCE_INTERNAL;
  hlptim1.Init.Input1Source = LPTIM_INPUT1SOURCE_GPIO;
  hlptim1.Init.Input2Source = LPTIM_INPUT2SOURCE_GPIO;
  if (HAL_LPTIM_Init(&hlptim1) != HAL_OK)
  {
    Error_Handler();
  }
  /* USER CODE BEGIN LPTIM1_Init 2 */

  /* USER CODE END LPTIM1_Init 2 */

}

/**
  * @brief GPIO Initialization Function
  * @param None
  * @retval None
  */
void MX_GPIO_Init(void)
{
  GPIO_InitTypeDef GPIO_InitStruct = {0};

  /* GPIO Ports Clock Enable */
  __HAL_RCC_GPIOB_CLK_ENABLE();

  /*Configure GPIO pin Output Level */
  HAL_GPIO_WritePin(GPIOB, GPIO_PIN_5, GPIO_PIN_RESET);

  /*Configure GPIO pin : PB5 */
  GPIO_InitStruct.Pin = GPIO_PIN_5;
  GPIO_InitStruct.Mode = GPIO_MODE_OUTPUT_PP;
  GPIO_InitStruct.Pull = GPIO_NOPULL;
  GPIO_InitStruct.Speed = GPIO_SPEED_FREQ_LOW;
  HAL_GPIO_Init(GPIOB, &GPIO_InitStruct);

}

/* USER CODE BEGIN 4 */
/*int32_t LED_control(int value) {
  HAL_GPIO_WritePin(GPIOB, GPIO_PIN_5, value);
  return 0;
}*/
/* USER CODE END 4 */
/* USER CODE BEGIN 4 */

void StartLoRaWANTask(void const * argument)
{
  MX_LoRaWAN_Init();
  AT_Join("1");
  for(;;)
  {
	MX_LoRaWAN_Process();
    osDelay(10);
  }
}
/* USER CODE END 4 */
/*void StartLedTask(void const * argument)
{
  LED_control(1);
  for(;;)
  {
	LED_control(0);
	osDelay(500);
	LED_control(1);
	osDelay(500);
  }
}*/


//concatenate 1:1: to the beginning of a string
char* concatPrefix(char* strHex, size_t len)
{
	char* str = (char*)malloc((len*2 + 5)*sizeof(char));

	str[0] = '1';
	str[1] = ':';
	str[2] = '1';
	str[3] = ':';

	for(int i = 0; i < len*2; i++){
		str[i+4] = strHex[i];
	}

	str[len*2 + 4] = '\0';

	return str;
}

//convert the buffer array into a string
char* arrayToString(uint8_t arr[], size_t size)
{
	uint8_t i, n = 0;
	char* dataStrHex = (char*)malloc((size*2 + 1)*sizeof(char));

	for(i = 0; i < size; i++){
		sprintf(dataStrHex + n, "%02x", arr[i]);
		n += 2;
	}
	dataStrHex[size*2] = '\0';

	return dataStrHex;
}

static bsec_library_return_t bme68x_bsec_update_subscription(float sample_rate, uint8_t sens_no)
{
    bsec_sensor_configuration_t requested_virtual_sensors[NUM_USED_OUTPUTS];
    uint8_t n_requested_virtual_sensors = NUM_USED_OUTPUTS;

    bsec_sensor_configuration_t required_sensor_settings[BSEC_MAX_PHYSICAL_SENSOR];
    uint8_t n_required_sensor_settings = BSEC_MAX_PHYSICAL_SENSOR;

    bsec_library_return_t status = BSEC_OK;

    /* note: Virtual sensors as desired to be added here */
	requested_virtual_sensors[0].sensor_id = BSEC_OUTPUT_RAW_PRESSURE;
    requested_virtual_sensors[0].sample_rate = sample_rate;
    requested_virtual_sensors[1].sensor_id = BSEC_OUTPUT_RAW_TEMPERATURE;
    requested_virtual_sensors[1].sample_rate = sample_rate;
    requested_virtual_sensors[2].sensor_id = BSEC_OUTPUT_RAW_HUMIDITY;
    requested_virtual_sensors[2].sample_rate = sample_rate;
    requested_virtual_sensors[3].sensor_id = BSEC_OUTPUT_RAW_GAS;
    requested_virtual_sensors[3].sample_rate = sample_rate;
#if (OUTPUT_MODE == CLASSIFICATION)
    requested_virtual_sensors[4].sensor_id = BSEC_OUTPUT_GAS_ESTIMATE_1;
    requested_virtual_sensors[4].sample_rate = sample_rate;
    requested_virtual_sensors[5].sensor_id = BSEC_OUTPUT_GAS_ESTIMATE_2;
    requested_virtual_sensors[5].sample_rate = sample_rate;
    requested_virtual_sensors[6].sensor_id = BSEC_OUTPUT_GAS_ESTIMATE_3;
    requested_virtual_sensors[6].sample_rate = sample_rate;
    requested_virtual_sensors[7].sensor_id = BSEC_OUTPUT_GAS_ESTIMATE_4;
    requested_virtual_sensors[7].sample_rate = sample_rate;
    requested_virtual_sensors[8].sensor_id = BSEC_OUTPUT_RAW_GAS_INDEX;
    requested_virtual_sensors[8].sample_rate = sample_rate;
#elif (OUTPUT_MODE == REGRESSION)
    requested_virtual_sensors[4].sensor_id = BSEC_OUTPUT_REGRESSION_ESTIMATE_1;
    requested_virtual_sensors[4].sample_rate = sample_rate;
    requested_virtual_sensors[5].sensor_id = BSEC_OUTPUT_REGRESSION_ESTIMATE_2;
    requested_virtual_sensors[5].sample_rate = sample_rate;
    requested_virtual_sensors[6].sensor_id = BSEC_OUTPUT_REGRESSION_ESTIMATE_3;
    requested_virtual_sensors[6].sample_rate = sample_rate;
    requested_virtual_sensors[7].sensor_id = BSEC_OUTPUT_REGRESSION_ESTIMATE_4;
    requested_virtual_sensors[7].sample_rate = sample_rate;
    requested_virtual_sensors[8].sensor_id = BSEC_OUTPUT_RAW_GAS_INDEX;
    requested_virtual_sensors[8].sample_rate = sample_rate;
#elif (OUTPUT_MODE == IAQ)
	requested_virtual_sensors[4].sensor_id = BSEC_OUTPUT_IAQ;
    requested_virtual_sensors[4].sample_rate = sample_rate;
    requested_virtual_sensors[5].sensor_id = BSEC_OUTPUT_SENSOR_HEAT_COMPENSATED_TEMPERATURE;
    requested_virtual_sensors[5].sample_rate = sample_rate;
    requested_virtual_sensors[6].sensor_id = BSEC_OUTPUT_SENSOR_HEAT_COMPENSATED_HUMIDITY;
    requested_virtual_sensors[6].sample_rate = sample_rate;
    requested_virtual_sensors[7].sensor_id = BSEC_OUTPUT_STATIC_IAQ;
    requested_virtual_sensors[7].sample_rate = sample_rate;
    requested_virtual_sensors[8].sensor_id = BSEC_OUTPUT_CO2_EQUIVALENT;
    requested_virtual_sensors[8].sample_rate = sample_rate;
    requested_virtual_sensors[9].sensor_id = BSEC_OUTPUT_BREATH_VOC_EQUIVALENT;
    requested_virtual_sensors[9].sample_rate = sample_rate;
    requested_virtual_sensors[10].sensor_id = BSEC_OUTPUT_STABILIZATION_STATUS;
    requested_virtual_sensors[10].sample_rate = sample_rate;
    requested_virtual_sensors[11].sensor_id = BSEC_OUTPUT_RUN_IN_STATUS;
    requested_virtual_sensors[11].sample_rate = sample_rate;
    requested_virtual_sensors[12].sensor_id = BSEC_OUTPUT_GAS_PERCENTAGE;
    requested_virtual_sensors[12].sample_rate = sample_rate;
#endif

    /* Call bsec_update_subscription() to enable/disable the requested virtual sensors */
    status = bsec_update_subscription_m(bsecInstance[sens_no], requested_virtual_sensors, n_requested_virtual_sensors, required_sensor_settings,
        &n_required_sensor_settings);

    return status;
}


/*!
 * @brief       This function is written to process the sensor data for the requested virtual sensors
 *
 * @param[in]   bsec_inputs         input structure containing the information on sensors to be passed to do_steps
 * @param[in]   num_bsec_inputs     number of inputs to be passed to do_steps
 * @param[in]   output_ready        pointer to the function processing obtained BSEC outputs
 *
 * @return      library function return codes, zero when successful
 */
static bsec_library_return_t bme68x_bsec_process_data(bsec_input_t *bsec_inputs, uint8_t num_bsec_inputs, output_ready_fct output_ready, uint8_t sens_no)
{
    /* Output buffer set to the maximum virtual sensor outputs supported */
    bsec_output_t bsec_outputs[BSEC_NUMBER_OUTPUTS];
    uint8_t num_bsec_outputs = 0;
    uint8_t index = 0;

    bsec_library_return_t bsec_status = BSEC_OK;

	output_t output = {0};

    /* Check if something should be processed by BSEC */
    if (num_bsec_inputs > 0)
    {
        /* Set number of outputs to the size of the allocated buffer */
        /* BSEC_NUMBER_OUTPUTS to be defined */
        num_bsec_outputs = BSEC_NUMBER_OUTPUTS;

        /* Perform processing of the data by BSEC
           Note:
           * The number of outputs you get depends on what you asked for during bsec_update_subscription(). This is
             handled under bme68x_bsec_update_subscription() function in this example file.
           * The number of actual outputs that are returned is written to num_bsec_outputs. */
        bsec_status = bsec_do_steps_m(bsecInstance[sens_no], bsec_inputs, num_bsec_inputs, bsec_outputs, &num_bsec_outputs);

        /* Iterate through the outputs and extract the relevant ones. */
        for (index = 0; index < num_bsec_outputs; index++)
        {
            switch (bsec_outputs[index].sensor_id)
            {
                case BSEC_OUTPUT_GAS_ESTIMATE_1:
                    output.gas_estimate_1 = bsec_outputs[index].signal;
					output.gas_accuracy_1 = bsec_outputs[index].accuracy;
                    break;
                case BSEC_OUTPUT_GAS_ESTIMATE_2:
                    output.gas_estimate_2 = bsec_outputs[index].signal;
					output.gas_accuracy_2 = bsec_outputs[index].accuracy;
                    break;
                case BSEC_OUTPUT_GAS_ESTIMATE_3:
                    output.gas_estimate_3 = bsec_outputs[index].signal;
					output.gas_accuracy_3 = bsec_outputs[index].accuracy;
                    break;
                case BSEC_OUTPUT_GAS_ESTIMATE_4:
                    output.gas_estimate_4 = bsec_outputs[index].signal;
					output.gas_accuracy_4 = bsec_outputs[index].accuracy;
                    break;
                case BSEC_OUTPUT_RAW_PRESSURE:
                    output.raw_pressure = bsec_outputs[index].signal;
                    break;
                case BSEC_OUTPUT_RAW_TEMPERATURE:
                    output.raw_temp = bsec_outputs[index].signal;
                    break;
                case BSEC_OUTPUT_RAW_HUMIDITY:
                    output.raw_humidity = bsec_outputs[index].signal;
                    break;
                case BSEC_OUTPUT_RAW_GAS:
                    output.raw_gas = bsec_outputs[index].signal;
                    break;
                case BSEC_OUTPUT_RAW_GAS_INDEX:
                    output.raw_gas_index = (uint8_t)bsec_outputs[index].signal;
                    break;
                case BSEC_OUTPUT_REGRESSION_ESTIMATE_1:
                    output.gas_estimate_1 = bsec_outputs[index].signal;
					output.gas_accuracy_1 = bsec_outputs[index].accuracy;
                    break;
                case BSEC_OUTPUT_REGRESSION_ESTIMATE_2:
                    output.gas_estimate_2 = bsec_outputs[index].signal;
					output.gas_accuracy_2 = bsec_outputs[index].accuracy;
                    break;
                case BSEC_OUTPUT_REGRESSION_ESTIMATE_3:
                    output.gas_estimate_3 = bsec_outputs[index].signal;
					output.gas_accuracy_3 = bsec_outputs[index].accuracy;
                    break;
                case BSEC_OUTPUT_REGRESSION_ESTIMATE_4:
                    output.gas_estimate_4 = bsec_outputs[index].signal;
					output.gas_accuracy_4 = bsec_outputs[index].accuracy;
                    break;
				case BSEC_OUTPUT_IAQ:
                    output.iaq = bsec_outputs[index].signal;
                    output.iaq_accuracy = bsec_outputs[index].accuracy;
                    break;
                case BSEC_OUTPUT_STATIC_IAQ:
                    output.static_iaq = bsec_outputs[index].signal;
                    break;
                case BSEC_OUTPUT_CO2_EQUIVALENT:
                    output.co2_equivalent = bsec_outputs[index].signal;
                    break;
                case BSEC_OUTPUT_BREATH_VOC_EQUIVALENT:
                    output.breath_voc_equivalent = bsec_outputs[index].signal;
                    break;
                case BSEC_OUTPUT_SENSOR_HEAT_COMPENSATED_TEMPERATURE:
                    output.temperature = bsec_outputs[index].signal;
                    break;
                case BSEC_OUTPUT_SENSOR_HEAT_COMPENSATED_HUMIDITY:
                    output.humidity = bsec_outputs[index].signal;
                    break;
                case BSEC_OUTPUT_STABILIZATION_STATUS:
                    output.stabStatus = bsec_outputs[index].signal;
                    break;
				case BSEC_OUTPUT_RUN_IN_STATUS:
                    output.runInStatus = bsec_outputs[index].signal;
                    break;
                case BSEC_OUTPUT_GAS_PERCENTAGE:
                    output.gas_percentage = bsec_outputs[index].signal;
                    break;
                default:
                    continue;
            }

            /* Assume that all the returned timestamps are the same */
            output.timestamp = bsec_outputs[index].time_stamp;
        }

		output.sens_no = sens_no;

        /* Pass the extracted outputs to the user provided output_ready() function. */
		output_ready(&output, bsec_status);
	}
	return bsec_status;
}

/*!
 * @brief       Read the data from registers and populate the inputs structure to be passed to do_steps function
 *
 * @param[in]   currTimeNs      		system timestamp value passed for processing data
 * @param[in]   data                  	input structure that contains the gas sensor data to be passed to process data
 * @param[in]   bsec_process_data       process data variable returned from sensor_control
 * @param[in]   output_ready        	pointer to the function processing obtained BSEC outputs
 *
 * @return      function result, one when successful & zero when unsuccessful
 */
uint8_t processData(int64_t currTimeNs, struct bme68x_data data, int32_t bsec_process_data, output_ready_fct output_ready, uint8_t sens_no)
{
    bsec_input_t inputs[BSEC_MAX_PHYSICAL_SENSOR]; /* Temp, Pres, Hum & Gas */
	bsec_library_return_t bsec_status = BSEC_OK;
    uint8_t nInputs = 0;
    /* Checks all the required sensor inputs, required for the BSEC library for the requested outputs */
    if (BSEC_CHECK_INPUT(bsec_process_data, BSEC_INPUT_HEATSOURCE))
    {
        inputs[nInputs].sensor_id = BSEC_INPUT_HEATSOURCE;
        inputs[nInputs].signal = 0.0f;//extTempOffset
        inputs[nInputs].time_stamp = currTimeNs;
        nInputs++;
    }
    if (BSEC_CHECK_INPUT(bsec_process_data, BSEC_INPUT_TEMPERATURE))
    {
#ifdef BME68X_USE_FPU
        inputs[nInputs].sensor_id = BSEC_INPUT_TEMPERATURE;
#else
        inputs[nInputs].sensor_id = BSEC_INPUT_TEMPERATURE / 100.0f;
#endif
        inputs[nInputs].signal = data.temperature;
        inputs[nInputs].time_stamp = currTimeNs;
        nInputs++;
    }
    if (BSEC_CHECK_INPUT(bsec_process_data, BSEC_INPUT_HUMIDITY))
    {
#ifdef BME68X_USE_FPU
        inputs[nInputs].sensor_id = BSEC_INPUT_HUMIDITY;
#else
        inputs[nInputs].sensor_id = BSEC_INPUT_HUMIDITY / 1000.0f;
#endif
        inputs[nInputs].signal = data.humidity;
        inputs[nInputs].time_stamp = currTimeNs;
        nInputs++;
    }
    if (BSEC_CHECK_INPUT(bsec_process_data, BSEC_INPUT_PRESSURE))
    {
        inputs[nInputs].sensor_id = BSEC_INPUT_PRESSURE;
        inputs[nInputs].signal = data.pressure;
        inputs[nInputs].time_stamp = currTimeNs;
        nInputs++;
    }
    if (BSEC_CHECK_INPUT(bsec_process_data, BSEC_INPUT_GASRESISTOR) &&
            (data.status & BME68X_GASM_VALID_MSK))
    {
        inputs[nInputs].sensor_id = BSEC_INPUT_GASRESISTOR;
        inputs[nInputs].signal = data.gas_resistance;
        inputs[nInputs].time_stamp = currTimeNs;
        nInputs++;
    }
    if (BSEC_CHECK_INPUT(bsec_process_data, BSEC_INPUT_PROFILE_PART) &&
            (data.status & BME68X_GASM_VALID_MSK))
    {
        inputs[nInputs].sensor_id = BSEC_INPUT_PROFILE_PART;
        inputs[nInputs].signal = 0;//(opMode[sens_no] == BME68X_FORCED_MODE) ? 0 : data.gas_index;
        inputs[nInputs].time_stamp = currTimeNs;
        nInputs++;
    }

    if (nInputs > 0)
    {
        /* Processing of the input signals and returning of output samples is performed by bsec_do_steps() */
		bsec_status = bme68x_bsec_process_data(inputs, nInputs, output_ready, sens_no);

        if (bsec_status != BSEC_OK)
            return 0;
    }
    return 1;
}


void output_ready(output_t *outputs, bsec_library_return_t bsec_status)
{
	char dataStr[100];
	if(outputs->sens_no == 0){
		output0.temperature = outputs->temperature;
		output0.humidity = outputs->humidity;
		output0.raw_pressure = outputs->raw_pressure;
		output0.breath_voc_equivalent = outputs->breath_voc_equivalent;
		output0.co2_equivalent = outputs->co2_equivalent;
		sprintf(dataStr, "BSEC::BME0:: temp: %.2f, hum: %.2f, iaq: %.2f, voc: %.2f, co2: %.2f\r\n", outputs->temperature, outputs->humidity, outputs->iaq, outputs->breath_voc_equivalent, outputs->co2_equivalent);
		APP_PPRINTF(dataStr);
	}
	if(outputs->sens_no == 1){
		output1.temperature = outputs->temperature;
		output1.humidity = outputs->humidity;
		output1.raw_pressure = outputs->raw_pressure;
		output1.breath_voc_equivalent = outputs->breath_voc_equivalent;
		output1.co2_equivalent = outputs->co2_equivalent;
		sprintf(dataStr, "BSEC::BME1:: temp: %.2f, hum: %.2f, iaq: %.2f, voc: %.2f, co2: %.2f\r\n", outputs->temperature, outputs->humidity, outputs->iaq, outputs->breath_voc_equivalent, outputs->co2_equivalent);
		APP_PPRINTF(dataStr);
	}
}


void allocateMemory(uint8_t *memBlock, uint8_t sens_no)
{
    /* allocating memory for the bsec instance */
    bsecInstance[sens_no] = memBlock;
}



void StartMonitorTask(void const * argument)
{
	struct bme68x_dev bme0;
	struct bme68x_dev bme1;
	int8_t rslt;
	bsec_library_return_t bsec_status = BSEC_OK;
	struct bme68x_conf conf;
	struct bme68x_heatr_conf heatr_conf;
	struct bme68x_data data0;
	struct bme68x_data data1;
	//uint32_t del_period;
	uint8_t n_fields;
	bsec_bme_settings_t sensor_settings[NUM_OF_SENS];

	uint8_t buffer[64];
	size_t message_length;
	bool status;
	char dataStr[64];
	int64_t time_stamp = 0;
	sensor_settings[0].next_call = 0;
	bool output0_r, output1_r = 0;
	//char dataStrHex[128];


	/* Interface preference is updated as a parameter
	 * For I2C : BME68X_I2C_INTF
	 * For SPI : BME68X_SPI_INTF
	 */
	///////////////////////////////
	//initialize BME with SDO Low//
	///////////////////////////////

	osDelay(5000);
	APP_PPRINTF("Initializing BME 0\r\n");
	memset(&bme0, 0, sizeof(bme0));
	allocateMemory(bsec_mem_block[0],0);

	rslt = bme68x_interface_init(&bme0, BME68X_I2C_INTF, 0);
	//bme0.intf_ptr = &dev_addr0;
	bme68x_check_rslt("bme68x_interface_init", rslt);

	rslt = bme68x_init(&bme0);
	bme68x_check_rslt("bme68x_init", rslt);

	rslt = bsec_init_m(bsecInstance[0]);
	bme68x_check_rslt("bme68x_init_m", rslt);

	bsec_status = bme68x_bsec_update_subscription(SAMPLE_RATE, 0);



	////////////////////////////////
	//initialize BME with SDO High//
	////////////////////////////////
	APP_PPRINTF("Initializing BME 1\r\n");
	memset(&bme1, 0, sizeof(bme1));
	allocateMemory(bsec_mem_block[1],1);

	rslt = bme68x_interface_init(&bme1, BME68X_I2C_INTF, 1);
	//bme0.intf_ptr = &dev_addr0;
	bme68x_check_rslt("bme68x_interface_init", rslt);

	rslt = bme68x_init(&bme1);
	bme68x_check_rslt("bme68x_init", rslt);

	rslt = bsec_init_m(bsecInstance[1]);
	bme68x_check_rslt("bme68x_init_m", rslt);

	bsec_status = bme68x_bsec_update_subscription(SAMPLE_RATE, 1);
	osDelay(5000);

	for(;;)
	  {
		osDelay(500);
		//time_stamp = (DWT->CYCCNT)*(int64_t)20;
		time_stamp += (int64_t)5e8;
		//////////////////////////////////////
		//Collect data for  BME with SDO LOW//
		//////////////////////////////////////
		if (time_stamp >= sensor_settings[0].next_call)
		{
			bsec_status = bsec_sensor_control_m(bsecInstance[0], time_stamp, &sensor_settings[0]);

			rslt = bme68x_get_conf(&conf, &bme0);
			if (rslt != BME68X_OK)
				return;

			conf.os_hum = sensor_settings->humidity_oversampling;
			conf.os_temp = sensor_settings->temperature_oversampling;
			conf.os_pres = sensor_settings->pressure_oversampling;
			rslt = bme68x_set_conf(&conf, &bme0);
			if (rslt != BME68X_OK)
				return;

			heatr_conf.enable = BME68X_ENABLE;
			heatr_conf.heatr_temp = sensor_settings->heater_temperature;
			heatr_conf.heatr_dur = sensor_settings->heater_duration;
			rslt = bme68x_set_heatr_conf(BME68X_FORCED_MODE, &heatr_conf, &bme0);
			if (rslt != BME68X_OK)
				return;

			rslt = bme68x_set_op_mode(BME68X_FORCED_MODE, &bme0);
			if (rslt != BME68X_OK)
				return;

			if(sensor_settings[0].trigger_measurement)
			{
				/* Check if rslt == BME68X_OK, report or handle if otherwise */
				rslt = bme68x_get_data(BME68X_FORCED_MODE, &data0, &n_fields, &bme0);
				bme68x_check_rslt("bme68x_get_data", rslt);

				sprintf(dataStr, "BME0:: temp: %.2f, hum: %.2f, press: %.2f, gas: %.2f\r\n", data0.temperature, data0.humidity, data0.pressure, data0.gas_resistance);
				APP_PPRINTF(dataStr);

				processData(time_stamp, data0, sensor_settings[0].process_data, output_ready, 0);

				output0_r = 1;
			}
		}

		osDelay(500);
		time_stamp += (int64_t)5e8;
		///////////////////////////////////////
		//Collect data for  BME with SDO High//
		///////////////////////////////////////
		if (time_stamp >= sensor_settings[1].next_call)
		{
			bsec_status = bsec_sensor_control_m(bsecInstance[1], time_stamp, &sensor_settings[1]);

			rslt = bme68x_get_conf(&conf, &bme1);
			if (rslt != BME68X_OK)
				return;

			conf.os_hum = sensor_settings->humidity_oversampling;
			conf.os_temp = sensor_settings->temperature_oversampling;
			conf.os_pres = sensor_settings->pressure_oversampling;
			rslt = bme68x_set_conf(&conf, &bme1);
			if (rslt != BME68X_OK)
				return;

			heatr_conf.enable = BME68X_ENABLE;
			heatr_conf.heatr_temp = sensor_settings->heater_temperature;
			heatr_conf.heatr_dur = sensor_settings->heater_duration;
			rslt = bme68x_set_heatr_conf(BME68X_FORCED_MODE, &heatr_conf, &bme1);
			if (rslt != BME68X_OK)
				return;

			rslt = bme68x_set_op_mode(BME68X_FORCED_MODE, &bme1);
			if (rslt != BME68X_OK)
				return;

			if(sensor_settings[1].trigger_measurement)
			{
				/* Check if rslt == BME68X_OK, report or handle if otherwise */
				rslt = bme68x_get_data(BME68X_FORCED_MODE, &data1, &n_fields, &bme1);
				bme68x_check_rslt("bme68x_get_data", rslt);

				sprintf(dataStr, "BME1:: temp: %.2f, hum: %.2f, press: %.2f, gas: %.2f\r\n", data1.temperature, data1.humidity, data1.pressure, data1.gas_resistance);
				APP_PPRINTF(dataStr);

				processData(time_stamp, data1, sensor_settings[1].process_data, output_ready, 1);

				output1_r = 1;
			}
		}

		if(output0_r && output1_r)
		{
			Message message = Message_init_zero;

			//Create a stream that will write to our buffer.
			pb_ostream_t stream = pb_ostream_from_buffer(buffer, sizeof(buffer));

			message.has_temperature = 1;
			message.has_humidity = 1;
			message.has_pressure = 1;
			message.has_co_2 = 1;
			message.has_voc = 1;
			message.has_temperature_2 = 1;
			message.has_humidity_2 = 1;
			message.has_pressure_2 = 1;
			message.has_co_2_2 = 1;
			message.has_voc_2 = 1;

			message.temperature = output0.temperature;//temp in celcius
			message.humidity = output0.humidity;//humidity in % relative humidity
			message.pressure = output0.raw_pressure;//pressure in pascals
			message.co_2 = output0.co2_equivalent; // CO2 in ppm
			message.voc = output0.breath_voc_equivalent;// VOC in ppm

			message.temperature_2 = output1.temperature;//temp in celcius
			message.humidity_2 = output1.humidity;//humidity in % relative humidity
			message.pressure_2 = output1.raw_pressure;//pressure in pascals
			message.co_2_2 = output1.co2_equivalent;// CO2 in ppm
			message.voc_2 = output1.breath_voc_equivalent;// VOC in ppm

			status = pb_encode(&stream, Message_fields, &message);
			message_length = stream.bytes_written;

			if (!status)
			{
				APP_PPRINTF("Encoding failed: %s\n", PB_GET_ERROR(&stream));
			}

			APP_PPRINTF("Bytes written: %d\n", message_length);

			char* dataStrHex = arrayToString(buffer, message_length);
			char* dataStrFinal = concatPrefix(dataStrHex, message_length);
			APP_PPRINTF("string: %s\n", dataStrFinal);

			if(message.temperature != 0 && message.pressure != 0 && message.co_2 != 0 && message.voc != 0)
			{
				AT_Send(dataStrFinal);
			}

			free(dataStrHex);
			free(dataStrFinal);

			output0_r = 0;
			output1_r = 0;
		}
		osDelay(900000);
		time_stamp += (int64_t)900e9;

	  }
}
/**
  * @brief  This function is executed in case of error occurrence.
  * @retval None
  */
void Error_Handler(void)
{
  /* USER CODE BEGIN Error_Handler_Debug */
  /* User can add his own implementation to report the HAL error return state */
  __disable_irq();
  while (1)
  {
  }
  /* USER CODE END Error_Handler_Debug */
}

#ifdef  USE_FULL_ASSERT
/**
  * @brief  Reports the name of the source file and the source line number
  *         where the assert_param error has occurred.
  * @param  file: pointer to the source file name
  * @param  line: assert_param error line source number
  * @retval None
  */
void assert_failed(uint8_t *file, uint32_t line)
{
  /* USER CODE BEGIN 6 */
  /* User can add his own implementation to report the file name and line number,
     ex: printf("Wrong parameters value: file %s on line %d\r\n", file, line) */
  while (1)
  {
  }
  /* USER CODE END 6 */
}
#endif /* USE_FULL_ASSERT */

/************************ (C) COPYRIGHT STMicroelectronics *****END OF FILE****/
