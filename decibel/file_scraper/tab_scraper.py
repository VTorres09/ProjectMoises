"""
This module contains all the methods you need for scraping either a single tab file or a predefined set of tab files
from the Internet.
"""

from selenium import webdriver
from os import path
from decibel.import_export.filehandler import _full_path_to
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
def download_tab(search: str, tab_directory: str, tab_name: str) -> (bool, str):
    """
    Download a tab file from the Internet, using the tab_url and place it in the tab_directory, called tab_name.
    Return a message indicating success or failure.
    :param tab_url: Location of the tab file on the Internet
    :param tab_directory: Local directory where the tab file should be placed on your machine
    :param tab_name: File name of your tab file
    :return: Boolean and str message, indicating success or failure
    """
    target_path = path.join(tab_directory, tab_name)
    if path.isfile(target_path):
        return False, None

    try:

        browser = webdriver.Chrome(executable_path=_full_path_to('chromedriver.exe', 'i'))
        wait = WebDriverWait(browser, 10)
        browser.get("https://www.cifraclub.com.br/")
        element = browser.find_element_by_xpath('//*[@id="js-h-search"]')
        element.send_keys(search)
        element = wait.until(EC.element_to_be_clickable((By.XPATH, '//*[@id="js-h-suggest"]/ul[1]/li[1]/a')))
        element.click()
        time.sleep(3)
        tab_text = browser.find_element_by_xpath("/html/body/div[1]/div[2]/div[3]/div[1]/div[1]/div[1]").text
        # _3F2CP _1rDYL _3F2CP _1rDYL _3F2CP _3hukP

        if tab_text != '':
            with open(target_path, 'w') as f:
                f.write(tab_text)
            print("You have successfully downloaded the tab file")
        else:
            print('We cannot download the tab file')

        browser.close()

    except Exception:
        browser.quit()
        return False, 'Error downloading ' + tab_name + ' on CifraClub'

    return True, 'Download succeeded'

def download_data_set_from_csv(csv_path: str, tab_directory: str):
    """
    Download a data set of tab files, as specified by the csv file in csv_path, and put them into tab_directory.
    If a tab file cannot be downloaded successfully, for example because the file already existed or because the
    Internet connection broke down, then the function continues with downloading the other tab files. After trying to
    download all prescribed tab files, this function returns a message indicating the number of tab files that were
    downloaded successfully and the number of tab files for which the download failed.

    :param csv_path: Path to the csv file with lines in format [url];[name];[key];[filename] (for example IndexTabs.csv)
    :param tab_directory: Local location for the downloaded files
    """
    nr_successful = 0
    nr_unsuccessful = 0

    # Open the csv file
    with open(csv_path, 'r') as read_file:
        csv_content = read_file.readlines()
    for line in csv_content:
        parts = line.rstrip().split(';')
        tab_url = parts[0]
        tab_name = parts[3]
        success, message = download_tab(tab_url, tab_directory, tab_name)
        if success:
            nr_successful += 1
        else:
            nr_unsuccessful += 1
            if message:
                print(message)

    print(str(nr_successful) + ' tab files were downloaded successfully. ' + str(nr_unsuccessful) + ' failed.')

