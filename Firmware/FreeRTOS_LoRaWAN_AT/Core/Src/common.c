/**
 * Copyright (C) 2023 Bosch Sensortec GmbH. All rights reserved.
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

#include <stdint.h>
#include <stdlib.h>
#include <stdio.h>
#include <stdbool.h>

#include "sys_app.h"
#include "bme68x.h"
#include "common.h"
#include "stm32wlxx_hal.h"
#include "i2c.h"

/******************************************************************************/
/*!                 Macro definitions                                         */
/*! BME68X shuttle board ID */
#define BME68X_SHUTTLE_ID  0x93

/******************************************************************************/
/*!                Static variable definition                                 */
static uint8_t dev_addr0;
static uint8_t dev_addr1;

/******************************************************************************/
/*!                User interface functions                                   */

/*!
 * I2C read function
 */
BME68X_INTF_RET_TYPE bme68x_i2c_read(uint8_t reg_addr, uint8_t *reg_data, uint32_t len, void *intf_ptr)
{
    uint8_t device_addr = *(uint8_t*)intf_ptr;

    (void)intf_ptr;

    HAL_I2C_Master_Transmit(&hi2c2, device_addr<<1, &reg_addr, 1, 100);

    return HAL_I2C_Master_Receive(&hi2c2, device_addr<<1, reg_data, (uint16_t)len, 100);
}

/*!
 * I2C write function
 */
BME68X_INTF_RET_TYPE bme68x_i2c_write(uint8_t reg_addr, const uint8_t *reg_data, uint32_t len, void *intf_ptr)
{
    uint8_t device_addr = *(uint8_t*)intf_ptr;

    (void)intf_ptr;

    uint8_t *buffer = malloc((len + 1) * sizeof(uint8_t));

    for (int i = 0; i < len+1; i++) {
    	buffer[i+1] = reg_data[i];
    }
	buffer[0] = reg_addr;

    //HAL_I2C_Master_Transmit(pI2CHandle, SHT31_DEFAULT_ADDR << 1, command_buffer, sizeof(command_buffer), 30)
	uint8_t resp = HAL_I2C_Master_Transmit(&hi2c2, device_addr<<1, buffer, (uint16_t)len + 1, 100);

	free(buffer);

	return resp;
}


/*!
 * Delay function map to COINES platform
 */
void bme68x_delay_us(uint32_t period, void *intf_ptr)
{
    (void)intf_ptr;
    osDelay(period/1000);
}

void bme68x_check_rslt(const char api_name[], int8_t rslt)
{
    switch (rslt)
    {
        case BME68X_OK:

            /* Do nothing */
            break;
        case BME68X_E_NULL_PTR:
            printf("API name [%s]  Error [%d] : Null pointer\r\n", api_name, rslt);
            break;
        case BME68X_E_COM_FAIL:
            printf("API name [%s]  Error [%d] : Communication failure\r\n", api_name, rslt);
            break;
        case BME68X_E_INVALID_LENGTH:
            printf("API name [%s]  Error [%d] : Incorrect length parameter\r\n", api_name, rslt);
            break;
        case BME68X_E_DEV_NOT_FOUND:
            printf("API name [%s]  Error [%d] : Device not found\r\n", api_name, rslt);
            break;
        case BME68X_E_SELF_TEST:
            printf("API name [%s]  Error [%d] : Self test error\r\n", api_name, rslt);
            break;
        case BME68X_W_NO_NEW_DATA:
            printf("API name [%s]  Warning [%d] : No new data found\r\n", api_name, rslt);
            break;
        default:
            printf("API name [%s]  Error [%d] : Unknown error code\r\n", api_name, rslt);
            break;
    }
}

int8_t bme68x_interface_init(struct bme68x_dev *bme, uint8_t intf, bool SDO)
{
    int8_t rslt = BME68X_OK;

    if (bme != NULL)
    {
        /* Bus configuration : I2C */
    	APP_PPRINTF("I2C Interface\n");
		dev_addr1 = BME68X_I2C_ADDR_HIGH;
		dev_addr0 = BME68X_I2C_ADDR_LOW;
    	//dev_addr = BME68X_I2C_ADDR_LOW;

		bme->read = bme68x_i2c_read;
		bme->write = bme68x_i2c_write;
		bme->intf = BME68X_I2C_INTF;


        bme->delay_us = bme68x_delay_us;
        if(SDO){
        	bme->intf_ptr = &dev_addr1;
		}else{
			bme->intf_ptr = &dev_addr0;
		}
        //bme->intf_ptr = &dev_addr0;
        bme->amb_temp = 25; /* The ambient temperature in deg C is used for defining the heater temperature */
    }
    else
    {
        rslt = BME68X_E_NULL_PTR;
    }

    return rslt;
}


