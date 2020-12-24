import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import { makeReport } from '../../models/dataset';
import { IAmplification, IBasicInfo, IExtraction, IFilteredOriginData, IFusion, IGeneTire, IIAmplification, IMutation, IPatient } from '../../models/patients';
import { PathologyService } from '../../services/pathology.service';
import { PathologySaveService } from '../../services/pathologysave.service';
import { SearchService } from '../../services/search.service';
import { clinically, msiScore, patientInfo, prevalent, tsvData, tumorcellpercentage, tumorMutationalBurden, tumortype } from './mockData';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss']
})
export class ReportComponent implements OnInit {

  doctor: string;
  engineer: string;
  filteredOriginData: IFilteredOriginData[] = [];
  index: number;
  patientInfo: IPatient;
  muTier: string;
  ampTier: string;
  fuTier: string;
  clinically = [];
  clinical: IGeneTire[] = [];
  prevalent = [];
  status = false;

  basicInfo: IBasicInfo = {
    name: '',
    registerNum: '',
    gender: '',
    pathologyNum: ''
  };
  dnanrna: string; // DNA and RNA extraction
  organ: string; // Organ 

  doctors: string;
  engineers: string;

  // 검체정보
  extraction: IExtraction = {
    dnarna: '',
    managementNum: '',
    keyblock: '',
    tumorcellpercentage: '',
    organ: '',
    tumortype: '',
    diagnosis: ''
  };
  // mutation = 'None';
  mutation: IMutation[] = []; // 0: "ERBB2 p.(I655V) c.1963A>G" 양식으로 된것
  amplifications: IAmplification[] = [];
  fusion: IFusion[] = [];
  imutation: IMutation[] = [];
  iamplifications: IIAmplification[] = [];
  ifusion: IFusion[] = [];


  tumorMutationalBurden = '';
  msiScore = '';
  tumorcellpercentage: string;
  generalReport = '';  // 해석적 보고
  constructor(
    private pathologyService: PathologyService,
    private router: Router,
    private savepathologyService: PathologySaveService,
    private searchService: SearchService,
    private fb: FormBuilder
  ) { }

  mutationForm: FormGroup;
  amplificationsForm: FormGroup;
  fusionForm: FormGroup;
  imutationForm: FormGroup;
  iamplificationsForm: FormGroup;
  ifusionForm: FormGroup;

  ngOnInit(): void {
    this.loadForm();
    // filtered 된 데이터 서비스에서 가져옴
    this.filteredOriginData = this.pathologyService.getFilteredTSV();
    console.log('[114][report.component][]', this.filteredOriginData);
    if (this.filteredOriginData === undefined) {
      // 서비스에서 저장된 값을 가져온다.
      this.status = true;
      this.patientInfo = this.pathologyService.getPatientInfo();
      console.log('[124][patientInfo][]', this.patientInfo);
      // 검체정보는 몇개가 빠져있어서 향후 추가해야함.
      this.extraction.managementNum = this.patientInfo.rel_pathology_num;
      this.extraction.keyblock = this.patientInfo.key_block;
      if (this.tumorcellpercentage === undefined || this.tumorcellpercentage === null) {
        this.extraction.tumorcellpercentage = '';
      } else {
        this.extraction.tumorcellpercentage = this.tumorcellpercentage;
      }

      this.extraction.tumortype = this.patientInfo.tumor_type;
      if (this.patientInfo.pathological_dx === undefined || this.patientInfo.pathological_dx === null) {
        this.patientInfo.pathological_dx = '';
      } else {
        this.extraction.diagnosis = this.patientInfo.pathological_dx;
      }

      this.getDataFromDB(this.patientInfo);
    } else {
      this.initByFile();
    }

  }

  loadForm(): void {
    this.mutationForm = this.fb.group({
      mutationLists: this.fb.array([]),
    });

    this.amplificationsForm = this.fb.group({
      amplificationsLists: this.fb.array([]),
    });


    this.fusionForm = this.fb.group({
      fusionLists: this.fb.array([]),
    });

    this.imutationForm = this.fb.group({
      imutationLists: this.fb.array([]),
    });

    this.iamplificationsForm = this.fb.group({
      iamplificationsLists: this.fb.array([]),
    });

    this.ifusionForm = this.fb.group({
      ifusionLists: this.fb.array([]),
    });
  }

  getDataFromDB(info: IPatient): void {
    const pathologyNo = info.pathology_num;
    console.log('[179][report][ getDataFromDB][] ', pathologyNo);

    this.searchService.getMutationC(pathologyNo)
      .subscribe(data => {
        console.log('[183][report][mutation]', data);
        if (data.message !== 'no data') {
          data.forEach(item => {
            this.mutation.push({
              gene: item.gene,
              aminoAcidChange: item.amino_acid_change,
              nucleotideChange: item.nucleotide_change,
              variantAlleleFrequency: item.variant_allele_frequency,
              ID: item.variant_id,
              tier: item.tier
            });
            this.mutationLists().push(this.createIMutaion({
              gene: item.gene,
              aminoAcidChange: item.amino_acid_change,
              nucleotideChange: item.nucleotide_change,
              variantAlleleFrequency: item.variant_allele_frequency,
              ID: item.variant_id,
              tier: item.tier
            }));
          });
        } else {
          this.mutation = [];
        }
      });

    this.searchService.getAmplificationC(pathologyNo)
      .subscribe(data => {
        console.log('[202][amplification]', data);
        if (data.message !== 'no data') {
          data.forEach(item => {
            this.amplifications.push({
              gene: item.gene,
              region: item.region,
              copynumber: item.estimated_copy_num,
              tier: item.tier
            });

            this.amplificationsLists().push(this.createAmplifications({
              gene: item.gene,
              region: item.region,
              copynumber: item.estimated_copy_num,
              tier: item.tier
            }));

          });

        } else {
          this.amplifications = [];
        }
      });

    this.searchService.getFusionC(pathologyNo)
      .subscribe(data => {
        console.log('[220][fusion]', data);
        if (data.message !== 'no data') {
          data.forEach(item => {

            this.fusion.push({
              gene: item.gene,
              breakpoint: item.breakpoing,
              readcount: item.readcount,
              function: item.function,
              tier: item.tier
            });
          });
        } else {
          this.fusion = [];
        }
      });

    this.searchService.getMutationP(pathologyNo)
      .subscribe(data => {
        console.log('[239][mutation]', data);
        if (data.message !== 'no data') {
          data.forEach(item => {

            this.imutation.push({
              gene: item.gene,
              aminoAcidChange: item.amino_acid_change,
              nucleotideChange: item.nucleotide_change,
              variantAlleleFrequency: item.variant_allele_frequency,
              ID: item.variant_id,
              tier: item.tier
            });
          });

        } else {
          this.imutation = [];
        }
      });

    this.searchService.getAmplificationP(pathologyNo)
      .subscribe(data => {
        console.log('[260][amplification]', data);
        if (data.message !== 'no data') {
          data.forEach(item => {
            this.iamplifications.push({
              gene: item.gene,
              region: item.region,
              copynumber: item.estimated_copy_num,
              note: item.note
            });
          });
        } else {
          this.iamplifications = [];
        }

      });

    this.searchService.getFusionP(pathologyNo)
      .subscribe(data => {
        console.log('[278][]', data);
        if (data.message !== 'no data') {
          data.forEach(item => {
            this.ifusion.push({
              gene: item.gene,
              breakpoint: item.breakpoing,
              readcount: item.readcount,
              function: item.function,
              tier: item.tier
            });
          });
        } else {
          this.ifusion = [];
        }
      });
  }


  initByFile(): void {

    // filtered 된 데이터 가져옴
    this.filteredOriginData = this.pathologyService.getFilteredTSV();
    console.log('[300][ initByFile]', this.filteredOriginData);
    // MSI Score
    this.msiScore = this.pathologyService.getMSIScore();

    // Tumor cell perentage
    this.tumorcellpercentage = this.pathologyService.getTumorCellPercentage();

    // tumor mutation burden" => 9.44
    this.tumorMutationalBurden = this.pathologyService.getTumorMutationalBurden();

    // tumor type
    const tumortypes = this.pathologyService.getTumortype();
    // const tumorType = tumortype;
    // 검체자 데이타
    this.patientInfo = this.pathologyService.getPatientInfo();
    console.log('[315][report][initByFile]', this.patientInfo);
    // Clinically significant biomarkers
    this.clinically = this.pathologyService.getClinically();
    this.clinical = this.pathologyService.getClinical();

    // prevalent cancer biomarkers
    this.prevalent = this.pathologyService.getPrevalent();

    // prevalent mutation
    // const pMutation = this.pathologyService.getPrevalentMuation();

    this.basicInfo.name = this.patientInfo.name;
    this.basicInfo.registerNum = this.patientInfo.patientID;
    this.basicInfo.gender = this.patientInfo.gender;
    this.basicInfo.pathologyNum = this.patientInfo.pathology_num;
    this.basicInfo.age = this.patientInfo.age;

    console.log('[보고서 유전자정보]', this.filteredOriginData);
    console.log('[보고서][msiscore]', this.msiScore);
    console.log('[보고서][tumorcellpercentage]', this.tumorcellpercentage);
    console.log('[보고서][tumorMutationalBurden]', this.tumorMutationalBurden);
    console.log('[보고서][tumortype]', tumortypes);
    console.log('[보고서][clinically]', this.clinically);
    console.log('[보고서][clinical]', this.clinical);
    console.log('[보고서][prevalent]', this.prevalent);
    console.log('[보고서][환자정보]', this.patientInfo);

    // 검체정보
    this.extraction.managementNum = this.patientInfo.rel_pathology_num;
    this.extraction.keyblock = this.patientInfo.key_block;
    if (this.tumorcellpercentage === undefined || this.tumorcellpercentage === null) {
      this.extraction.tumorcellpercentage = '';
    } else {
      this.extraction.tumorcellpercentage = this.tumorcellpercentage;
    }

    this.extraction.tumortype = tumortypes;
    if (this.patientInfo.pathological_dx === undefined || this.patientInfo.pathological_dx === null) {
      this.patientInfo.pathological_dx = '';
    } else {
      this.extraction.diagnosis = this.patientInfo.pathological_dx;
    }


    this.clinically.forEach(item => {
      const members = item.trim().split(' ');
      let gene = members[0].trim().replace(/"/g, '');
      const type = members[1].trim().replace(/"/g, '');
      console.log('[363][clinically]: ', item, gene, type);
      if (type.charAt(0) === 'p') {
        // const indexm = this.findGeneInfo(gene);
        let customid;
        const tier = this.findTier(gene);  // clinical 에서 gene, tier, frequency 찿기

        const itemMembers = item.split(' ');
        const aminoAcidChange = itemMembers[1];
        const nucleotideChange = itemMembers[2];
        // console.log('[153]', gene, tier);
        const indexm = this.findGeneInfo(gene);
        console.log('[378]', gene, indexm);
        if (indexm !== -1) {
          customid = this.filteredOriginData[indexm].variantID;
        } else {
          customid = '';
        }

        const variantAlleleFrequency = this.findFrequency(gene);
        //  console.log('[157][]', item, gene, aminoAcidChange, nucleotideChange, variantAlleleFrequency, tier);
        this.mutation.push({
          gene,
          aminoAcidChange,
          nucleotideChange,
          variantAlleleFrequency,
          ID: customid,
          tier
        });
        //  console.log('[166][mutation]', this.mutation);

      } else if (type === 'amplification') {
        const indexa = this.findGeneInfo(gene);
        const tier = this.findTier(gene);
        if (indexa > 0) {
          const cytoband = this.filteredOriginData[indexa].cytoband.split(')');
          this.amplifications.push({
            gene: this.filteredOriginData[indexa].gene,
            region: cytoband[0] + ')',
            copynumber: cytoband[1],
            tier
          });
          // console.log('[270][amplifications tier 확인]', this.amplifications);
        }
      } else if (type === 'fusion') {
        let oncomine;
        if (gene === 'PTPRZ1-MET') {
          // gene = 'PTPRZ1(1) - MET(2)';
        }
        const index = this.findGeneInfo(gene);
        const tier = this.findTier(gene);
        console.log('[413][fusion]', type, gene, index, tier);

        if (index > 0) {
          if (this.filteredOriginData[index].oncomine === 'Loss-of-function') {
            oncomine = 'Loss';
          } else if (this.filteredOriginData[index].oncomine === 'Gain-of-function') {
            oncomine = 'Gain';
          }

          this.fusion.push({
            gene: this.filteredOriginData[index].gene,
            breakpoint: this.filteredOriginData[index].locus,
            readcount: this.filteredOriginData[index].readcount,
            function: oncomine,
            tier
          });
        }
      }
    });

    console.log('[447][initByFile][mutation]', this.mutation, this.amplifications);

    if (this.mutation.length) {
      console.log('[448][initByFile][mutation]', this.mutation);
      this.mutation.forEach(mItem => {
        this.mutationLists().push(this.createMutaion(mItem));
      });
    }

    if (this.amplifications.length) {
      console.log('[454][initByFile][amplifications]', this.mutation);
      this.amplifications.forEach(aItem => {
        this.amplificationsLists().push(this.createAmplifications(aItem));
      });
    }


    this.prevalent.forEach(item => {
      const members = item.trim().split(',');

      // let gene = members[0].trim().replace(/"/g, '');
      // const type = members[1].trim().replace(/"/g, '');
      const temps = members[0].split(' ');
      const gene = temps[0].trim().replace(/"/g, '');
      const type = temps[1].trim().replace(/"/g, '');
      console.log('[470][prevalent]', gene, type);
      if (type.charAt(0) === 'p') {
        let customid = '';
        let variantAlleleFrequency = '';
        const items = members[0].split(' ');
        const aminoAcidchange = items[1];
        const nucleotidechange = items[2];

        console.log('[478][prevalent]', gene, aminoAcidchange, nucleotidechange);

        const indexm = this.withGeneCoding(gene, nucleotidechange);

        if (indexm !== -1) {
          customid = this.filteredOriginData[indexm].variantID;
          if (customid === undefined || customid === null) { customid = ''; }
          variantAlleleFrequency = this.filteredOriginData[indexm].frequency;

          if (variantAlleleFrequency === null || variantAlleleFrequency === undefined) { variantAlleleFrequency = ''; }
        } else {
          customid = '';
        }

        this.imutation.push({
          gene,
          aminoAcidChange: aminoAcidchange,
          nucleotideChange: nucleotidechange,
          variantAlleleFrequency,
          ID: customid,
          tier: ''
        });

      } else if (type === 'amplification') {
        const indexa = this.findGeneInfo(gene);
        console.log('[341][prevelant] ', item, indexa);
        if (indexa > 0) {
          const cytoband = this.filteredOriginData[indexa].cytoband.split(')');
          this.iamplifications.push({
            gene: this.filteredOriginData[indexa].gene,
            region: cytoband[0] + ')',
            copynumber: cytoband[1],
            note: ''
          });
        }
      } else if (type === 'fusion') {
        let oncomine;
        if (gene === 'PTPRZ1-MET') {
          // gene = 'PTPRZ1(1) - MET(2)';
        }
        const index = this.findGeneInfo(gene);
        if (index > 0) {
          if (this.filteredOriginData[index].oncomine === 'Loss-of-function') {
            oncomine = 'Loss';
          } else if (this.filteredOriginData[index].oncomine === 'Gain-of-function') {
            oncomine = 'Gain';
          }
          this.ifusion.push({
            gene: this.filteredOriginData[index].gene,
            breakpoint: this.filteredOriginData[index].locus,
            readcount: this.filteredOriginData[index].readcount,
            function: oncomine
          });
        }
      }
    });


  }

  withGeneCoding(gene: string, coding: string): number {
    const idx = this.filteredOriginData.findIndex(item => item.gene === gene && item.coding === coding);
    return idx;
  }

  findGeneInfo(gene: string): number {
    let tempGene;
    if (gene === 'PTPRZ1-MET') {
      tempGene = 'PTPRZ1(1) - MET(2)';
      gene = tempGene;
    }
    const idx = this.filteredOriginData.findIndex(item => item.gene === gene);
    return idx;
  }

  findFrequency(gene): string {
    const idx = this.clinical.findIndex(list => list.gene === gene);
    if (idx === -1) {
      return 'none';
    }
    return this.clinical[idx].frequency;
  }

  findTier(gene): string {
    // console.log('[246][findTier]', this.clinical, gene);
    const idx = this.clinical.findIndex(list => list.gene === gene);
    // console.log('[248][findTier]', this.clinical[idx]);
    if (idx === -1) {
      return 'none';
    }
    return this.clinical[idx].tier;
  }
  // DNA and RNA extraction
  setDNAandRNAextraction(dna: string): void {
    console.log('[544][setDNAandRNAextraction]', dna);
    this.dnanrna = dna;
  }

  setOrgan(organ: string): void {
    console.log('[549][setDNAandRNAextraction]', organ);
    this.organ = organ;
  }

  // tslint:disable-next-line: typedef
  sendEMR() {
    const form = makeReport(
      this.dnanrna,
      this.organ,
      this.basicInfo,
      this.extraction,
      this.mutation,
      this.amplifications,
      this.fusion,
      this.imutation,
      this.iamplifications,
      this.ifusion,
      this.tumorMutationalBurden,
      this.msiScore,
      this.generalReport
    );
    console.log(form);

    // NU로 데이터 전송
    this.pathologyService.sendEMR(this.patientInfo, form).subscribe(data => {
      // console.log('[404][sendEMR 결과]', data);
      alert(data);
      this.router.navigate(['/pathology']);
    });

  }

  mutationTier(index: number, i: string): void {
    this.mutation[index].tier = i;
  }

  amplificationTier(index: number, i: string): void {
    this.amplifications[index].tier = i;
  }

  fusionTier(index: number, i: string): void {
    this.fusion[index].tier = i;
  }
  imutationTier(index: number, i: string): void {
    this.imutation[index].tier = i;
  }

  ifusionTier(index: number, i: string): void {
    this.ifusion[index].tier = i;
  }

  // tslint:disable-next-line: typedef
  savePathologyData() {
    console.log('[602][savePathologyData][]', this.basicInfo.pathologyNum,
      this.mutation, this.amplifications, this.fusion, this.imutation, this.iamplifications, this.ifusion);
    this.savepathologyService.savePathologyData(
      this.basicInfo.pathologyNum,
      this.mutation,
      this.amplifications,
      this.fusion,
      this.imutation,
      this.iamplifications,
      this.ifusion,
      this.extraction
    )
      .subscribe(data => {
        console.log(data);
        if (data.info === 'SUCCESS') {
          alert('저장 했습니다.');
          this.router.navigate(['/pathology']);
        }
      });

  }

  // mutationForm

  createMutaion(mutation: IMutation): FormGroup {
    console.log('[617][][createMutaion][mutation]', mutation);
    return this.fb.group({
      gene: mutation.gene,
      aminoAcidChange: mutation.aminoAcidChange,
      nucleotideChange: mutation.nucleotideChange,
      variantAlleleFrequency: mutation.variantAlleleFrequency,
      ID: mutation.ID,
      tier: mutation.tier
    });
  }

  mutationLists(): FormArray {
    return this.mutationForm.get('mutationLists') as FormArray;
  }

  newMutation(): FormGroup {
    return this.fb.group({
      gene: '',
      aminoAcidChange: '',
      nucleotideChange: '',
      variantAlleleFrequency: '',
      ID: '',
      tier: ''
    });
  }

  addMutation(): void {
    this.mutationLists().push(this.newMutation());
  }

  removeMutation(i: number): void {
    this.mutationLists().removeAt(i);
  }
  /////////////////////////////////////////////////////////////////////
  // amplificationsForm

  createAmplifications(amplifications: IAmplification): FormGroup {
    return this.fb.group({
      gene: amplifications.gene,
      region: amplifications.region,
      copynumber: amplifications.copynumber,
      tier: amplifications.tier
    });
  }

  amplificationsLists(): FormArray {
    return this.amplificationsForm.get('amplificationsLists') as FormArray;
  }

  newAmplifications(): FormGroup {
    return this.fb.group({
      gene: '',
      region: '',
      copynumber: '',
      tier: ''
    });
  }

  addAmplifications(): void {
    this.amplificationsLists().push(this.newAmplifications());
  }

  removeAmplifications(i: number): void {
    this.amplificationsLists().removeAt(i);
  }
  ////////////////////////////////////////////////////////////////////
  // fusionForm

  createFusion(fusion: IFusion): FormGroup {
    return this.fb.group({
      gene: fusion.gene,
      breakpoint: fusion.breakpoint,
      readcount: fusion.readcount,
      function: fusion.function,
      tier: fusion.tier
    });
  }

  fusionLists(): FormArray {
    return this.fusionForm.get('fusionLists') as FormArray;
  }

  newFusion(): FormGroup {
    return this.fb.group({
      gene: '',
      breakpoint: '',
      readcount: '',
      function: '',
      tier: ''
    });
  }

  addFusion(): void {
    this.fusionLists().push(this.newFusion());
  }

  removeFusion(i: number): void {
    this.fusionLists().removeAt(i);
  }

  ////////////////////////////////////////////////////////////////////
  // imutationForm
  createIMutaion(mutation: IMutation): FormGroup {
    return this.fb.group({
      gene: mutation.gene,
      aminoAcidChange: mutation.aminoAcidChange,
      nucleotideChange: mutation.nucleotideChange,
      variantAlleleFrequency: mutation.variantAlleleFrequency,
      ID: mutation.ID,
      tier: mutation.tier
    });
  }

  imutationLists(): FormArray {
    return this.imutationForm.get('imutationLists') as FormArray;
  }

  newIMutation(): FormGroup {
    return this.fb.group({
      gene: '',
      aminoAcidChange: '',
      nucleotideChange: '',
      variantAlleleFrequency: '',
      ID: '',
      tier: ''
    });
  }

  addIMutation(): void {
    this.imutationLists().push(this.newIMutation());
  }

  removeIMutation(i: number): void {
    this.imutationLists().removeAt(i);
  }

  /////////////////////////////////////////////////////////////////////
  // iamplificationsForm
  createIAmplifications(amplifications: IIAmplification): FormGroup {
    console.log('[855][createIAmplifications][amplifications]', amplifications);
    return this.fb.group({
      gene: amplifications.gene,
      region: amplifications.region,
      copynumber: amplifications.copynumber,
      note: amplifications.note
    });
  }

  iamplificationsLists(): FormArray {
    return this.iamplificationsForm.get('iamplificationsLists') as FormArray;
  }

  newIAmplifications(): FormGroup {
    return this.fb.group({
      gene: '',
      region: '',
      copynumber: '',
      note: ''
    });
  }

  addIAmplifications(): void {
    this.iamplificationsLists().push(this.newIAmplifications());
  }

  removeIAmplifications(i: number): void {
    this.iamplificationsLists().removeAt(i);
  }
  ////////////////////////////////////////////////////////////////////
  // ifusionForm

  createIFusion(fusion: IFusion): FormGroup {
    return this.fb.group({
      gene: fusion.gene,
      breakpoint: fusion.breakpoint,
      readcount: fusion.readcount,
      function: fusion.function,
      tier: fusion.tier
    });
  }

  ifusionLists(): FormArray {
    return this.ifusionForm.get('ifusionLists') as FormArray;
  }

  newIFusion(): FormGroup {
    return this.fb.group({
      gene: '',
      breakpoint: '',
      readcount: '',
      function: '',
      tier: ''
    });
  }

  addIFusion(): void {
    this.ifusionLists().push(this.newIFusion());
  }

  removeIFusion(i: number): void {
    this.ifusionLists().removeAt(i);
  }
  ////////////////////////////////////////////////////////////////////



}
